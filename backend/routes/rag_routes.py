"""
Advanced RAG Chat Routes
Main endpoint for RAG-based question answering with document processing
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from typing import Optional, List
import psycopg2
from psycopg2.extras import RealDictCursor, execute_values
from backend.database.db import get_db
from backend.auth_utils import get_current_user
from backend.models.rag_models import (
    RAGChatResponse, RetrievedChunk, DocumentMetadata,
    ProcessingStatus, UserDocumentIndex
)
from backend.utils.advanced_processor import document_processor
from backend.utils.vector_store import EmbeddingModel, VectorStore, HybridRetriever
import logging
import json
import ast
import requests
from backend.config import settings
from datetime import datetime
import uuid
import time
import asyncio
import os
import glob
import re
from pathlib import Path

router = APIRouter()
logger = logging.getLogger(__name__)

# Global embedding model (loaded once)
embedding_model = None


def get_embedding_model():
    """Get or initialize embedding model"""
    global embedding_model
    if embedding_model is None:
        embedding_model = EmbeddingModel(model_name="all-MiniLM-L6-v2")
    return embedding_model


class AdvancedRAGSystem:
    """Advanced RAG system with document processing and semantic search"""
    
    @staticmethod
    def _get_llm_model_info() -> Optional[str]:
        """Get LLM model information if provider is configured"""
        provider = getattr(settings, 'LLM_PROVIDER', '').strip().lower()
        if provider:
            llm_model = getattr(settings, 'GROK_MODEL', 'llama-3.1-8b-instant')
            return f"{provider}:{llm_model}"
        return None
    
    @staticmethod
    def _handle_acknowledgment(question_lower: str) -> Optional[str]:
        """Handle acknowledgment and short messages professionally
        
        Args:
            question_lower: Lowercase question text
            
        Returns:
            Professional response if it's an acknowledgment, None otherwise
        """
        # Remove punctuation and extra spaces
        question_clean = re.sub(r'[^\w\s]', '', question_lower).strip()
        words = question_clean.split()
        
        # Very short messages (1-3 words) that are acknowledgments
        if len(words) <= 3:
            # Positive acknowledgments
            if any(word in question_clean for word in ["perfect", "great", "excellent", "awesome", "nice", "good", "ok", "okay", "fine", "cool", "sure", "yes", "yeah", "yep"]):
                return "I'm glad I could help. Feel free to ask if you need any additional information."
            
            # Thank you messages
            if any(word in question_clean for word in ["thanks", "thank", "appreciate", "grateful"]):
                return "You're welcome. I'm here to assist you whenever you need help."
            
            # Agreement/confirmation
            if any(word in question_clean for word in ["correct", "right", "exactly", "precisely", "agreed"]):
                return "I'm pleased that the information was helpful. Let me know if you have any other questions."
        
        # Check for very short questions that might be acknowledgments
        if len(words) <= 2 and any(word in question_clean for word in ["ok", "okay", "sure", "yes", "yeah"]):
            return "I'm here to help. What would you like to know?"
        
        return None
    
    @staticmethod
    def _enhance_with_markdown(text: str) -> str:
        """Enhance text with markdown formatting for professional presentation
        
        Args:
            text: Plain text response
            
        Returns:
            Text with markdown formatting applied
        """
        if not text or len(text.strip()) < 10:
            return text
        
        # Don't modify if already has markdown
        if '**' in text or '*' in text or '#' in text or '- ' in text or '* ' in text:
            return text
        
        # Split into sentences
        sentences = re.split(r'(?<=[.!?])\s+', text)
        
        # Check if it's a list-like response (contains "include", "are:", "consists of", etc.)
        text_lower = text.lower()
        is_list_response = any(phrase in text_lower for phrase in [
            "include", "are:", "consists of", "comprises", "features", "skills", "topics", "items"
        ])
        
        if is_list_response and len(sentences) > 1:
            # Format as a list with bullet points
            # Find the main sentence and list items
            main_sentence = sentences[0]
            list_items = []
            
            # Extract list items from remaining sentences
            for sent in sentences[1:]:
                # Check if sentence contains list indicators
                if any(indicator in sent.lower() for indicator in ["and", ",", "such as"]):
                    # Split by common separators
                    items = re.split(r',\s+(?:and\s+)?', sent)
                    list_items.extend([item.strip().rstrip('.') for item in items if item.strip()])
                else:
                    list_items.append(sent.strip().rstrip('.'))
            
            if list_items:
                # Format with bold header and bullet points
                formatted = f"**{main_sentence.rstrip('.')}**\n\n"
                formatted += "\n".join([f"- {item}" for item in list_items[:10]])  # Limit to 10 items
                return formatted
        
        # For regular responses, add emphasis to key terms
        # This is a simple enhancement - the LLM should handle most formatting
        return text
    
    def __init__(self, db_connection):
        self.db = db_connection
        self.embedding_model = get_embedding_model()
        self.vector_store = VectorStore(db_connection)
        self.retriever = HybridRetriever(db_connection)
    
    def ensure_tables_exist(self):
        """Ensure all RAG tables exist"""
        try:
            cursor = self.db.cursor()
            
            # Documents table (namespaced for RAG)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS rag_documents (
                    document_id VARCHAR(36) PRIMARY KEY,
                    user_id VARCHAR(36) NOT NULL,
                    filename VARCHAR(255) NOT NULL,
                    file_type VARCHAR(20),
                    file_size INTEGER,
                    total_chunks INTEGER DEFAULT 0,
                    total_tokens INTEGER DEFAULT 0,
                    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    processing_status VARCHAR(50) DEFAULT 'pending',
                    error_message TEXT,
                    embedding_model VARCHAR(100) DEFAULT 'all-MiniLM-L6-v2'
                );
            """)
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_rag_doc_user ON rag_documents(user_id)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_rag_doc_status ON rag_documents(processing_status)")
            
            # Document chunks table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS rag_document_chunks (
                    chunk_id VARCHAR(36) PRIMARY KEY,
                    document_id VARCHAR(36) NOT NULL,
                    content TEXT NOT NULL,
                    chunk_index INTEGER,
                    start_char INTEGER,
                    end_char INTEGER,
                    tokens_count INTEGER,
                    metadata JSONB,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (document_id) REFERENCES rag_documents(document_id) ON DELETE CASCADE
                );
            """)
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_rag_chunk_doc ON rag_document_chunks(document_id)")
            
            # Embeddings table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS rag_embeddings (
                    embedding_id VARCHAR(36) PRIMARY KEY,
                    chunk_id VARCHAR(36) NOT NULL,
                    document_id VARCHAR(36) NOT NULL,
                    user_id VARCHAR(36) NOT NULL,
                    embedding BYTEA NOT NULL,
                    embedding_model VARCHAR(100),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (chunk_id) REFERENCES rag_document_chunks(chunk_id) ON DELETE CASCADE
                );
            """)
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_rag_emb_user_doc ON rag_embeddings(user_id, document_id)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_rag_emb_chunk ON rag_embeddings(chunk_id)")
            
            # Chat sessions with RAG context
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS rag_chat_sessions (
                    session_id VARCHAR(36) PRIMARY KEY,
                    user_id VARCHAR(36) NOT NULL,
                    title VARCHAR(255),
                    document_ids JSONB,
                    total_messages INTEGER DEFAULT 0,
                    total_tokens INTEGER DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_rag_user_sessions ON rag_chat_sessions(user_id)")
            
            # RAG chat messages
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS rag_chat_messages (
                    message_id VARCHAR(36) PRIMARY KEY,
                    session_id VARCHAR(36) NOT NULL,
                    role VARCHAR(20),
                    content TEXT,
                    retrieved_chunks JSONB,
                    confidence FLOAT,
                    processing_time_ms FLOAT,
                    tokens_used INTEGER,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (session_id) REFERENCES rag_chat_sessions(session_id) ON DELETE CASCADE
                );
            """)
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_rag_msg_session ON rag_chat_messages(session_id)")
            
            self.db.commit()
            logger.info("All RAG tables created/verified")
            cursor.close()
        except Exception as e:
            logger.error(f"Error creating tables: {e}")
            self.db.rollback()

    async def _process_bytes(self, document_id: str, file_content: bytes, filename: str, user_id: str):
        """Process raw bytes for a document (chunking, embedding, storing) with logging.

        This method is safe to call from a background task.
        """
        logger.info(f"Background processing started for document {document_id} (user {user_id})")
        cursor = self.db.cursor()
        try:
            file_size = len(file_content)

            # Chunk the document
            chunks, file_type = await document_processor.process_file_for_rag(
                file_content, filename, chunking_strategy="semantic"
            )

            if not chunks:
                raise Exception("No chunks produced from document")

            # Prepare chunk insert data
            chunk_ids = []
            chunk_texts = []
            total_tokens = 0
            chunk_data = []
            for chunk in chunks:
                chunk_id = str(uuid.uuid4())
                chunk_ids.append(chunk_id)
                chunk_texts.append(chunk['content'])
                total_tokens += chunk.get('tokens_count', 0)
                chunk_data.append((
                    chunk_id,
                    document_id,
                    chunk['content'],
                    chunk.get('chunk_index'),
                    chunk.get('start_char'),
                    chunk.get('end_char'),
                    chunk.get('tokens_count'),
                    json.dumps(chunk.get('metadata', {}))
                ))

            # Batch insert chunks
            try:
                execute_values(
                    cursor,
                    """
                    INSERT INTO rag_document_chunks
                    (chunk_id, document_id, content, chunk_index, start_char, end_char, tokens_count, metadata)
                    VALUES %s
                    """,
                    chunk_data
                )
                self.db.commit()
                logger.info(f"Inserted {len(chunk_data)} chunks for document {document_id}")
            except Exception as e:
                self.db.rollback()
                logger.error(f"Failed to insert chunks for {document_id}: {e}")
                raise

            # Generate embeddings
            try:
                embeddings = self.embedding_model.embed_batch(chunk_texts)
            except Exception as e:
                logger.error(f"Embedding generation failed for {document_id}: {e}")
                raise

            # Store embeddings as bytes
            try:
                embedding_data = [
                    (
                        str(uuid.uuid4()),
                        chunk_id,
                        document_id,
                        user_id,
                        embeddings[idx].astype('float32').tobytes(),
                        self.embedding_model.model_name
                    )
                    for idx, chunk_id in enumerate(chunk_ids)
                ]

                execute_values(
                    cursor,
                    """
                    INSERT INTO rag_embeddings
                    (embedding_id, chunk_id, document_id, user_id, embedding, embedding_model)
                    VALUES %s
                    """,
                    embedding_data
                )
                self.db.commit()
                logger.info(f"Stored {len(embedding_data)} embeddings for document {document_id}")
            except Exception as e:
                self.db.rollback()
                logger.error(f"Failed to store embeddings for {document_id}: {e}")
                raise

            # Update document record
            cursor.execute("""
                UPDATE rag_documents SET
                    total_chunks = %s,
                    total_tokens = %s,
                    file_type = %s,
                    processing_status = %s
                WHERE document_id = %s
            """, (len(chunk_data), total_tokens, file_type, 'completed', document_id))
            self.db.commit()
            logger.info(f"Document {document_id} processing completed")

        except Exception as e:
            logger.error(f"Background processing error for {document_id}: {e}")
            try:
                cursor.execute("UPDATE rag_documents SET processing_status = %s, error_message = %s WHERE document_id = %s", ('failed', str(e), document_id))
                self.db.commit()
            except:
                self.db.rollback()
        finally:
            try:
                cursor.close()
            except:
                pass
    
    async def process_and_index_document(
        self,
        file: UploadFile,
        user_id: str
    ) -> dict:
        """Process document, chunk it, generate embeddings, and store in vector DB"""
        document_id = str(uuid.uuid4())
        doc_name = file.filename
        
        try:
            cursor = self.db.cursor()
            
            # Read file content
            file_content = await file.read()
            file_size = len(file_content)
            
            # Ensure user_id is string (RAG tables use VARCHAR)
            user_id_str = str(user_id) if not isinstance(user_id, str) else user_id
            
            # Record initial document metadata
            cursor.execute("""
                INSERT INTO rag_documents 
                (document_id, user_id, filename, file_size, processing_status, embedding_model)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, [
                document_id, user_id_str, doc_name, file_size,
                'processing', self.embedding_model.model_name
            ])
            self.db.commit()
            
            # Process file and chunk it
            chunks, file_type = await document_processor.process_file_for_rag(
                file_content, doc_name, chunking_strategy="semantic"
            )
            
            # Extract chunk texts and metadata
            chunk_ids = []
            chunk_texts = []
            total_tokens = 0
            
            # Store chunks in database
            chunk_data = []
            for chunk in chunks:
                chunk_id = str(uuid.uuid4())
                chunk_ids.append(chunk_id)
                chunk_texts.append(chunk['content'])
                total_tokens += chunk['tokens_count']
                
                chunk_data.append((
                    chunk_id,
                    document_id,
                    chunk['content'],
                    chunk['chunk_index'],
                    chunk['start_char'],
                    chunk['end_char'],
                    chunk['tokens_count'],
                    str(chunk['metadata'])
                ))
            
            # Batch insert chunks
            execute_values(
                cursor,
                """
                INSERT INTO rag_document_chunks
                (chunk_id, document_id, content, chunk_index, start_char, end_char, tokens_count, metadata)
                VALUES %s
                """,
                chunk_data
            )
            self.db.commit()
            
            logger.info(f"Stored {len(chunks)} chunks for document {document_id}")
            
            # Generate embeddings for all chunks
            try:
                embeddings = self.embedding_model.embed_batch(chunk_texts)
                
                # Store embeddings
                embedding_data = [
                    (
                        str(uuid.uuid4()),  # embedding_id
                        chunk_id,
                        document_id,
                        user_id,
                        # Convert numpy array to bytes for storage
                        embeddings[idx].astype('float32').tobytes(),
                        self.embedding_model.model_name
                    )
                    for idx, chunk_id in enumerate(chunk_ids)
                ]
                
                execute_values(
                    cursor,
                    """
                    INSERT INTO rag_embeddings
                    (embedding_id, chunk_id, document_id, user_id, embedding, embedding_model)
                    VALUES %s
                    """,
                    embedding_data
                )
                self.db.commit()
                logger.info(f"Generated and stored {len(embeddings)} embeddings")
                
            except Exception as e:
                logger.error(f"Embedding generation error: {e}")
                raise
            
            # Update document status
            cursor.execute("""
                UPDATE rag_documents SET
                    total_chunks = %s,
                    total_tokens = %s,
                    file_type = %s,
                    processing_status = %s
                WHERE document_id = %s
            """, [len(chunks), total_tokens, file_type, 'completed', document_id])
            self.db.commit()
            
            cursor.close()
            
            return {
                "document_id": document_id,
                "filename": doc_name,
                "chunks_created": len(chunks),
                "total_tokens": total_tokens,
                "file_type": file_type,
                "status": "completed"
            }
        
        except Exception as e:
            logger.error(f"Document processing error: {e}")
            
            # Update document with error status
            try:
                cursor = self.db.cursor()
                cursor.execute("""
                    UPDATE rag_documents SET
                        processing_status = %s,
                        error_message = %s
                    WHERE document_id = %s
                """, ['failed', str(e), document_id])
                self.db.commit()
                cursor.close()
            except:
                pass
            
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to process document: {str(e)}"
            )
    
    async def rag_chat(
        self,
        question: str,
        user_id: str,
        context: str = "documents",
        document_ids: Optional[List[str]] = None,
        top_k: int = 5,
        similarity_threshold: float = 0.3,
        organization_name: Optional[str] = None
    ) -> dict:
        """RAG-based chat with semantic search and context injection
        
        Args:
            question: User's question
            user_id: User ID
            context: Context mode - 'documents' or 'general'
            document_ids: Optional list of document IDs to search in
            top_k: Number of chunks to retrieve
            similarity_threshold: Minimum similarity score
        """
        
        start_time = time.time()
        
        try:
            # Handle acknowledgment and short messages professionally
            question_lower = question.lower().strip()
            acknowledgment_responses = AdvancedRAGSystem._handle_acknowledgment(question_lower)
            if acknowledgment_responses:
                return {
                    "answer": acknowledgment_responses,
                    "sources": [],
                    "language": "en-US",
                    "confidence": 0.95,
                    "processing_time_ms": (time.time() - start_time) * 1000,
                    "model_used": self.embedding_model.model_name,
                    "llm_model": self._get_llm_model_info(),
                    "retrieval_count": 0
                }
            
            # For document search context, use RAG with document retrieval
            if context == "documents" and document_ids:
                # Hybrid search for relevant chunks
                retrieved_chunks = self.retriever.hybrid_search(
                    query=question,
                    document_ids=document_ids,
                    user_id=user_id,
                    top_k=top_k
                )

                # Filter by threshold with better quality control
                # Use a more strict threshold for better relevance
                quality_threshold = max(similarity_threshold, 0.4)  # Minimum 0.4 for quality
                filtered_chunks = [r for r in retrieved_chunks if r.get('score', 0) >= quality_threshold]
                
                # If no high-quality results, check if we have any reasonable matches
                if not filtered_chunks and retrieved_chunks:
                    # Use slightly lower threshold but still maintain quality
                    filtered_chunks = [r for r in retrieved_chunks if r.get('score', 0) >= 0.3][:top_k]
                
                # If still no results, it means the question doesn't match the documents well
                if not filtered_chunks:
                    return {
                        "answer": "I couldn't find relevant information in the uploaded documents to answer your question. Please ensure your question relates to the document content, or try rephrasing it. I'm available to help with other questions.",
                        "sources": [],
                        "language": "en-US",
                        "confidence": 0.0,
                        "processing_time_ms": (time.time() - start_time) * 1000,
                        "model_used": self.embedding_model.model_name,
                        "llm_model": self._get_llm_model_info(),
                        "retrieval_count": 0
                    }
                
                # Improve context by ranking chunks based on question relevance
                # This ensures different questions get different, more relevant context
                question_words = set(re.findall(r'\w+', question.lower()))
                question_words = {w for w in question_words if len(w) > 3}  # Filter short words
                
                # Score and rank chunks by question relevance
                scored_chunks = []
                for chunk in filtered_chunks:
                    content = chunk.get('content', '').lower()
                    similarity_score = chunk.get('score', 0)
                    
                    # Count question word matches in content
                    word_matches = sum(1 for word in question_words if word in content)
                    # Boost score if question words appear in content
                    relevance_boost = word_matches * 0.1
                    final_score = similarity_score + relevance_boost
                    
                    scored_chunks.append({
                        'content': chunk.get('content', ''),
                        'score': final_score,
                        'original_score': similarity_score,
                        'word_matches': word_matches
                    })
                
                # Sort by final relevance score
                scored_chunks.sort(key=lambda x: x['score'], reverse=True)
                
                # Take top chunks, but ensure diversity - don't take all from same section
                # Limit to top 5-7 chunks to avoid too much context
                top_chunks = scored_chunks[:min(7, len(scored_chunks))]
                
                # Prepare context from top-ranked chunks
                context_text = "\n\n".join([
                    chunk['content']
                    for chunk in top_chunks
                ])

                # Fetch filenames for provenance information
                doc_id_map = {}
                try:
                    doc_ids = list({r.get('document_id') for r in filtered_chunks if r.get('document_id')})
                    if doc_ids:
                        c = self.db.cursor(cursor_factory=RealDictCursor)
                        c.execute("SELECT document_id, filename FROM rag_documents WHERE document_id = ANY(%s)", [doc_ids])
                        rows = c.fetchall()
                        for row in rows:
                            doc_id_map[row['document_id']] = row.get('filename')
                        c.close()
                except Exception as e:
                    logger.debug(f"Failed to fetch filenames for provenance: {e}")
                
                # Check if context actually contains relevant information
                if not context_text or len(context_text.strip()) < 20:
                    return {
                        "answer": "I couldn't find relevant information in the uploaded documents to answer your question. Please ensure your question relates to the document content, or try rephrasing it. I'm available to help with other questions.",
                        "sources": [],
                        "language": "en-US",
                        "confidence": 0.0,
                        "processing_time_ms": (time.time() - start_time) * 1000,
                        "model_used": self.embedding_model.model_name,
                        "retrieval_count": 0
                    }
                
                # Generate response with RAG context
                answer = self._generate_answer_with_context(question, context_text, context_mode=context)
                
                # Check if answer is meaningful (not empty or just error message)
                if not answer or len(answer.strip()) < 20:
                    return {
                        "answer": "The information needed to answer your question is not available in the uploaded documents. Please try asking a different question related to the document content, or ensure the relevant documents are uploaded.",
                        "sources": sources,
                        "language": "en-US",
                        "confidence": 0.0,
                        "processing_time_ms": (time.time() - start_time) * 1000,
                        "model_used": self.embedding_model.model_name,
                        "llm_model": self._get_llm_model_info(),
                        "retrieval_count": len(filtered_chunks)
                    }
                
                # Format answer with organization signature
                answer = self._format_answer_with_signature(answer, organization_name)
                
                # Prepare response
                processing_time = (time.time() - start_time) * 1000  # Convert to ms
                
                # Convert to RetrievedChunk format
                sources = []
                for r in filtered_chunks:
                    docid = r.get('document_id')
                    filename = doc_id_map.get(docid) if docid else None
                    excerpt = (r.get('content') or '')[:250]
                    meta = {
                        "source": r.get('source', 'unknown'),
                        "filename": filename,
                        "excerpt": excerpt
                    }
                    sources.append(
                        RetrievedChunk(
                            chunk_id=r.get('chunk_id'),
                            document_id=docid,
                            content=(r.get('content') or '')[:500],  # Truncate for response
                            similarity_score=float(r.get('score', 0)),
                            chunk_index=r.get('chunk_index', 0) if r.get('chunk_index') is not None else 0,
                            metadata=meta
                        )
                    )
                
                return {
                    "answer": answer,
                    "sources": sources,
                    "language": "en-US",
                    "confidence": 0.92 if filtered_chunks else 0.5,
                    "processing_time_ms": processing_time,
                    "model_used": self.embedding_model.model_name,
                    "llm_model": self._get_llm_model_info(),  # Added LLM model information
                    "retrieval_count": len(filtered_chunks)
                }
            else:
                # For general context, try to search organization documents
                # First check if context is documents but no document_ids provided
                if context == "documents" and not document_ids:
                    # Search all user documents - handle both string and integer user_id
                    cursor = self.db.cursor(cursor_factory=RealDictCursor)
                    # Convert user_id to string for comparison (RAG tables use VARCHAR)
                    user_id_str = str(user_id) if not isinstance(user_id, str) else user_id
                    cursor.execute("SELECT document_id FROM rag_documents WHERE user_id = %s AND processing_status = 'completed'", [user_id_str])
                    all_doc_ids = [row['document_id'] for row in cursor.fetchall()]
                    cursor.close()
                    
                    if all_doc_ids:
                        document_ids = all_doc_ids
                        # Recursively call with document IDs
                        return await self.rag_chat(question, user_id, context, document_ids, top_k, similarity_threshold, organization_name)
                
                # For general context, search organization documents
                if context == "general":
                    org_context = await self._search_organization_documents(question, context, top_k)
                    if org_context:
                        # Generate response with organization document context
                        answer = self._generate_answer_with_context(question, org_context['context_text'], context_mode=context)
                        # Format answer with organization signature
                        answer = self._format_answer_with_signature(answer, organization_name)
                        processing_time = (time.time() - start_time) * 1000
                        
                        # Convert sources to RetrievedChunk format
                        sources = []
                        for source_info in org_context.get('sources', []):
                            filename = source_info.get('filename', 'unknown')
                            # Sanitize filename for use as document_id (remove special chars, keep alphanumeric and underscores)
                            sanitized_filename = re.sub(r'[^a-zA-Z0-9_-]', '_', filename)
                            # Use sanitized filename as document_id for organization documents (with prefix to distinguish)
                            org_doc_id = f"org_doc_{context}_{sanitized_filename}"
                            sources.append(
                                RetrievedChunk(
                                    chunk_id=str(uuid.uuid4()),
                                    document_id=org_doc_id,
                                    content=source_info.get('excerpt', ''),
                                    similarity_score=0.85,
                                    chunk_index=0,
                                    metadata={
                                        "source": "organization_documents",
                                        "filename": filename,
                                        "excerpt": source_info.get('excerpt', ''),
                                        "context": context
                                    }
                                )
                            )
                        
                        return {
                            "answer": answer,
                            "sources": sources,
                            "language": "en-US",
                            "confidence": 0.85,
                            "processing_time_ms": processing_time,
                            "model_used": self.embedding_model.model_name,
                            "llm_model": self._get_llm_model_info(),
                            "retrieval_count": org_context.get('retrieval_count', 0)
                        }
                
                # Generate context-aware response without document retrieval
                answer = self._generate_context_aware_response(question, context)
                # Format answer with organization signature
                answer = self._format_answer_with_signature(answer, organization_name)
                processing_time = (time.time() - start_time) * 1000
                
                return {
                    "answer": answer,
                    "sources": [],
                    "language": "en-US",
                    "confidence": 0.75,
                    "processing_time_ms": processing_time,
                    "model_used": self.embedding_model.model_name,
                    "llm_model": self._get_llm_model_info(),
                    "retrieval_count": 0
                }
        
        except Exception as e:
            logger.error(f"RAG chat error: {e}")
            raise
    
    @staticmethod
    def _generate_answer_with_context(question: str, context: str, context_mode: str = "documents") -> str:
        """Generate answer using LLM or rule-based system with injected context
        
        Args:
            question: User's question
            context: Retrieved document context
            context_mode: Context type - 'documents' or 'general'
        """
        if not context:
            return f"I couldn't find relevant information in the uploaded documents to answer your question. Please ensure documents are uploaded and try rephrasing your question. I'm available to help with other questions."
        
        # Prefer sentence-level extraction and concise responses as a fallback (2-3 sentences max).
        local_answer = AdvancedRAGSystem._extract_answer_from_context(question, context, max_sentences=3)

        # If an external LLM provider is configured, call it with the context + question
        provider = getattr(settings, 'LLM_PROVIDER', '').strip().lower()
        if provider:
            # Context-aware system prompts (employee-focused, professional and polite)
            system_prompts = {
                "documents": (
                    "You are an expert document analysis assistant with a warm, professional, and human-like communication style. "
                    "Your role is to provide accurate, contextually relevant answers based ONLY on the provided document context. "
                    "CRITICAL RULES - FOLLOW STRICTLY:\n"
                    "1. Focus specifically on answering the EXACT question asked - each question requires a unique, tailored response\n"
                    "2. Do NOT repeat or rephrase the user's question in your answer\n"
                    "3. Do NOT ask any questions in your response - provide only statements and answers\n"
                    "4. Do NOT include sentences ending with question marks (?)\n"
                    "5. Do NOT mention sources, filenames, or document names\n"
                    "6. Provide a direct, professional answer that directly addresses what was asked\n"
                    "7. If asked about 'topics', list the main topics. If asked about 'skills', list the skills. "
                    "   If asked about 'education', provide education details. Each question type requires a different response.\n"
                    "8. Write with a natural, human touch - be conversational yet professional\n"
                    "9. Keep responses concise but complete (2-4 sentences for detailed answers, 1-2 for simple facts)\n"
                    "10. Do not include phrases like 'according to the document' or 'the document states'\n"
                    "11. Answer as if you are providing the information directly, not referencing documents\n"
                    "12. NEVER end your response with questions like 'Would you like to know more?' or 'Do you have any other questions?'\n"
                    "13. Vary your responses - different questions should produce different answers, even if from the same document\n"
                    "14. Extract and present information that specifically matches the question's intent\n"
                    "15. FORMATTING: Use markdown formatting to make responses professional and visually appealing:\n"
                    "    - Use **bold** for key terms, important concepts, or section headers\n"
                    "    - Use *italic* for emphasis on specific details\n"
                    "    - Use bullet points (- or *) for lists of items (skills, topics, features, etc.)\n"
                    "    - Use numbered lists (1., 2., 3.) for sequential information\n"
                    "    - Structure longer answers with clear sections using bold headers\n"
                    "    - Example: '**Skills include:**\\n- Python\\n- Machine Learning\\n- *Advanced* AI techniques'\n"
                    "Example 1: If asked 'What are the main topics?', answer: '**Main Topics:**\\n- Topic 1\\n- Topic 2\\n- Topic 3'\n"
                    "Example 2: If asked 'What are the skills?', answer: '**Skills include:**\\n- Skill 1\\n- Skill 2\\n- *Advanced* Skill 3'\n"
                    "Each answer must be unique, tailored to the specific question asked, and professionally formatted."
                ),
                "general": (
                    "You are a professional, courteous, and helpful assistant for employees and new interns. Provide friendly, informative, and polite responses about the organization, "
                    "policies, procedures, employee benefits, onboarding, and general workplace questions. "
                    "CRITICAL RULES:\n"
                    "1. Do NOT ask questions in your response - provide only statements and information\n"
                    "2. Do NOT include sentences ending with question marks (?)\n"
                    "3. Always greet users warmly, respond professionally, and end with a polite closing statement (not a question)\n"
                    "4. Be supportive, conversational, and maintain a professional tone using declarative statements only\n"
                    "5. Keep responses concise (2-3 sentences maximum)\n"
                    "6. Focus on helping employees, especially new ones, understand how things work in the organization\n"
                    "7. Offer further assistance using statements like 'I'm available to help with additional questions' NOT 'Do you have any other questions?'"
                ),
            }
            
            system_prompt = system_prompts.get(context_mode, system_prompts["documents"])
            
            # Analyze question type to provide better context
            question_lower = question.lower()
            question_type = "general"
            if any(word in question_lower for word in ["topic", "topics", "subject", "subjects", "theme", "themes"]):
                question_type = "topics"
            elif any(word in question_lower for word in ["skill", "skills", "ability", "abilities", "competence"]):
                question_type = "skills"
            elif any(word in question_lower for word in ["education", "degree", "qualification", "study", "studies"]):
                question_type = "education"
            elif any(word in question_lower for word in ["who", "person", "name", "individual"]):
                question_type = "person"
            elif any(word in question_lower for word in ["what", "describe", "explain", "tell me about"]):
                question_type = "description"
            
            prompt = (
                f"{system_prompt}\n\n"
                f"Document Context:\n{context}\n\n"
                f"User Question: {question}\n"
                f"Question Type: {question_type}\n\n"
                f"CRITICAL INSTRUCTIONS:\n"
                f"- Focus ONLY on information that directly answers this specific question\n"
                f"- If the question asks about '{question_type}', extract and present ONLY that type of information\n"
                f"- Provide a unique, tailored response that directly addresses what was asked\n"
                f"- Do NOT repeat the question. Do NOT ask any questions in your response.\n"
                f"- Do NOT include sentences ending with question marks.\n"
                f"- Do NOT mention that information comes from documents.\n"
                f"- Write naturally with a human touch - be conversational yet professional.\n"
                f"- If the context doesn't contain relevant information, politely state that the information is not available.\n\n"
                f"Answer (tailored to the question, statements only, no questions):"
            )
            
            try:
                # Increase max_tokens for more detailed, question-specific responses
                llm_response = call_llm(prompt, max_tokens=400)
                if llm_response:
                    # Prefer LLM response
                    text = llm_response.strip()
                    # Clean answer to remove question repetition
                    text = AdvancedRAGSystem._clean_answer(text, question)
                    # Enhance with markdown formatting if needed
                    text = AdvancedRAGSystem._enhance_with_markdown(text)
                    # Allow more length for detailed answers (up to 800 chars for formatted responses)
                    if len(text) > 800:
                        truncated = text[:800]
                        last_period = truncated.rfind('.')
                        if last_period > 400:
                            text = truncated[:last_period + 1]
                        else:
                            # Try to find a good breaking point
                            last_newline = truncated.rfind('\n')
                            if last_newline > 500:
                                text = truncated[:last_newline]
                            else:
                                last_comma = truncated.rfind(',')
                                if last_comma > 600:
                                    text = truncated[:last_comma] + '.'
                                else:
                                    text = truncated.rstrip() + '...'
                    return text
            except Exception as e:
                logger.error(f"LLM call failed: {e}. Falling back to local extractor.")

        # Fall back to local rule-based extraction
        answer = local_answer
        # Already limited to 400 chars in _extract_answer_from_context
        if not answer:
            return f"I couldn't find relevant information in the documents to answer your question. Please rephrase your question or ensure the relevant documents are uploaded. I'm available to help with other questions."
        return answer
    
    @staticmethod
    def _generate_context_aware_response(question: str, context_mode: str) -> str:
        """Generate context-aware response for non-document queries (employee-focused)
        
        Args:
            question: User's question
            context_mode: Context type - 'general' or 'documents'
        """
        provider = getattr(settings, 'LLM_PROVIDER', '').strip().lower()
        
        if provider:
            system_prompts = {
                "general": (
                    "You are a professional, courteous, and friendly assistant for employees and new interns. "
                    "Answer questions about the organization, policies, procedures, employee benefits, onboarding, "
                    "workplace culture, and general employee information. Always greet users warmly and respond professionally. "
                    "CRITICAL RULES:\n"
                    "1. Do NOT ask questions in your response - provide only statements and information\n"
                    "2. Do NOT include sentences ending with question marks (?)\n"
                    "3. Be supportive, conversational, and maintain a polite, professional tone using declarative statements only\n"
                    "4. Keep responses concise (2-3 sentences maximum)\n"
                    "5. Focus on helping employees, especially new ones\n"
                    "6. Always end responses with a polite closing statement (not a question) like 'I'm available to help with additional questions'"
                ),
                "documents": (
                    "You are a professional document analysis assistant. "
                    "However, no documents were provided for this query. "
                    "Politely inform the user that they need to upload documents first to get document-based answers, "
                    "and offer to help them with the upload process or answer general questions."
                )
            }
            
            system_prompt = system_prompts.get(context_mode, system_prompts["general"])
            
            prompt = (
                f"{system_prompt}\n\n"
                f"User Question: {question}\n\n"
                f"CRITICAL: Provide a helpful response using only declarative statements. Do NOT ask any questions. Do NOT include sentences ending with question marks.\n\n"
                f"Response:"
            )
            
            try:
                llm_response = call_llm(prompt, max_tokens=200)  # Reduced for concise responses
                if llm_response:
                    text = llm_response.strip()
                    # Clean answer to remove questions and question repetition
                    text = AdvancedRAGSystem._clean_answer(text, question)
                    # Limit to 400 characters for 2-3 sentences
                    if len(text) > 400:
                        truncated = text[:400]
                        last_period = truncated.rfind('.')
                        if last_period > 200:
                            text = truncated[:last_period + 1]
                        else:
                            text = truncated.rstrip() + '...'
                    return text
            except Exception as e:
                logger.error(f"LLM call failed: {e}. Falling back to rule-based response.")
        
        # Fallback rule-based responses (employee-focused, concise, 2-3 sentences)
        question_lower = question.lower().strip()
        
        # Check for greetings and polite openings
        greeting_words = ["hello", "hi", "hey", "greetings", "good morning", "good afternoon", "good evening", "greet"]
        is_greeting = any(word in question_lower for word in greeting_words) and len(question_lower.split()) <= 5
        
        # Check for thank you and closing messages
        closing_words = ["thank", "thanks", "appreciate", "grateful", "bye", "goodbye", "see you", "farewell"]
        is_closing = any(word in question_lower for word in closing_words)
        
        if context_mode == "general":
            if is_greeting:
                return "Hello! Welcome to the organization. I'm here to assist you with any questions about our policies, procedures, employee benefits, onboarding, or general information. I'm available to help you with any information you need."
            elif is_closing:
                return "You're very welcome! I'm glad I could assist you. If you have any other questions, please don't hesitate to ask. Have a wonderful day!"
            elif any(word in question_lower for word in ["help", "what can you do", "capabilities"]):
                return "I'd be happy to help! I can assist you with organization information, company policies, employee benefits, onboarding procedures, and document search. I'm available to provide information on any of these topics."
            elif any(word in question_lower for word in ["new", "intern", "employee", "first day", "onboarding", "start"]):
                return "Welcome to the organization! I'm here to help you get started. I can provide information about our policies, procedures, benefits, and what to expect during your onboarding. I'm ready to assist with any specific information you need."
            elif any(word in question_lower for word in ["policy", "policies", "rules", "guidelines"]):
                return f"I'd be happy to help you understand our organizational policies and guidelines. Please feel free to ask a specific question about any policy, or I can guide you to the relevant policy documents."
            elif any(word in question_lower for word in ["benefit", "benefits", "leave", "vacation", "sick"]):
                return f"I can help you understand our employee benefits and leave policies. Please ask a specific question about benefits, or I can direct you to our employee handbook for detailed information."
            elif any(word in question_lower for word in ["who", "what", "where", "when", "how"]):
                return f"I'd be pleased to help you with that. To provide you with the most accurate information, please provide a bit more context about what you're looking for."
            else:
                return f"Thank you for your question. I'm here to assist you with any questions about the organization, policies, and procedures. Please provide a bit more detail so I can help you more effectively."
        
        else:
            return f"Thank you for reaching out. I'm available to assist you with any information you need."
    
    async def _search_organization_documents(self, question: str, context: str, top_k: int = 5) -> Optional[dict]:
        """Search organization documents in the general folder (employee-focused)
        
        Args:
            question: User's question
            context: Context type - 'general' (only general is supported now)
            top_k: Number of documents to search
        Returns:
            Dictionary with context_text, sources, and retrieval_count, or None if no documents found
        """
        try:
            # Get the path to organization_documents folder
            backend_path = Path(__file__).parent.parent
            org_docs_path = backend_path / "organization_documents" / context
            
            # Ensure the directory exists
            org_docs_path.mkdir(parents=True, exist_ok=True)
            
            # Search for all supported file types
            file_patterns = ['*.pdf', '*.txt', '*.docx', '*.doc']
            all_files = []
            for pattern in file_patterns:
                all_files.extend(glob.glob(str(org_docs_path / pattern)))
            
            if not all_files:
                return None
            
            # Extract text from documents and search for relevant content
            question_words = set(word.lower() for word in question.split() if len(word) > 3)
            relevant_chunks = []
            sources = []
            
            for file_path in all_files[:top_k * 2]:  # Check more files to get top_k relevant chunks
                try:
                    filename = os.path.basename(file_path)
                    
                    # Read file content based on type
                    if filename.endswith('.txt'):
                        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                            content = f.read()
                    elif filename.endswith('.pdf'):
                        # For PDF, use the document processor
                        try:
                            with open(file_path, 'rb') as f:
                                file_bytes = f.read()
                            chunks, _ = await document_processor.process_file_for_rag(
                                file_bytes, filename, chunking_strategy="semantic"
                            )
                            if chunks:
                                content = '\n\n'.join([chunk.get('content', '') for chunk in chunks])
                            else:
                                continue
                        except Exception as e:
                            logger.debug(f"Error processing PDF {filename}: {e}")
                            continue
                    elif filename.endswith(('.docx', '.doc')):
                        # For Word documents, use the document processor
                        try:
                            with open(file_path, 'rb') as f:
                                file_bytes = f.read()
                            chunks, _ = await document_processor.process_file_for_rag(
                                file_bytes, filename, chunking_strategy="semantic"
                            )
                            if chunks:
                                content = '\n\n'.join([chunk.get('content', '') for chunk in chunks])
                            else:
                                continue
                        except Exception as e:
                            logger.debug(f"Error processing Word document {filename}: {e}")
                            continue
                    else:
                        continue
                    
                    # Simple keyword matching to find relevant chunks
                    content_lower = content.lower()
                    score = sum(1 for word in question_words if word in content_lower)
                    
                    if score > 0:
                        # Split content into sentences for better chunking
                        sentences = content.split('. ')
                        for sentence in sentences[:20]:  # Limit to first 20 sentences per file
                            sentence_lower = sentence.lower()
                            sentence_score = sum(1 for word in question_words if word in sentence_lower)
                            if sentence_score > 0:
                                relevant_chunks.append({
                                    'content': sentence.strip(),
                                    'score': sentence_score,
                                    'source': filename
                                })
                        
                        if filename not in sources:
                            sources.append(filename)
                
                except Exception as e:
                    logger.debug(f"Error processing organization document {file_path}: {e}")
                    continue
            
            # Sort by relevance score and take top_k
            relevant_chunks.sort(key=lambda x: x['score'], reverse=True)
            top_chunks = relevant_chunks[:top_k]
            
            if not top_chunks:
                return None
            
            # Combine chunks into context text (without source mentions)
            context_text = '\n\n'.join([
                chunk['content']
                for chunk in top_chunks
            ])
            
            return {
                'context_text': context_text,
                'sources': [{'filename': chunk['source'], 'excerpt': chunk['content'][:200]} for chunk in top_chunks],
                'retrieval_count': len(top_chunks)
            }
        
        except Exception as e:
            logger.error(f"Error searching organization documents: {e}")
            return None

    @staticmethod
    def _format_answer_with_signature(answer: str, organization_name: Optional[str] = None) -> str:
        """Format answer with organization signature
        
        Args:
            answer: The answer text
            organization_name: Optional organization name to append
        Returns:
            Formatted answer with signature
        """
        if not answer:
            return answer
        
        # Clean up the answer - remove any source mentions
        # Remove patterns like [Source: ...] or (Source: ...)
        import re
        answer = re.sub(r'\[Source:[^\]]+\]', '', answer)
        answer = re.sub(r'\(Source:[^\)]+\)', '', answer)
        answer = re.sub(r'Source:\s*[^\n]+', '', answer)
        answer = re.sub(r'---+', '', answer)  # Remove separator lines
        answer = re.sub(r'\s+', ' ', answer)  # Normalize whitespace
        answer = answer.strip()
        
        # Remove any question phrases that might have been added
        question_phrases_to_remove = [
            r'if\s+you\s+have\s+any\s+further\s+questions[,\s]+please\s+don\'?t\s+hesitate\s+to\s+ask[\.]?',
            r'if\s+you\s+have\s+any\s+other\s+questions[,\s]+please\s+don\'?t\s+hesitate\s+to\s+ask[\.]?',
            r'if\s+you\s+have\s+any\s+further\s+questions[,\s]+please\s+feel\s+free\s+to\s+ask[\.]?',
            r'feel\s+free\s+to\s+ask\s+if\s+you\s+have\s+any\s+questions[\.]?',
        ]
        for phrase in question_phrases_to_remove:
            answer = re.sub(phrase, '', answer, flags=re.IGNORECASE)
        
        # Clean up any double newlines or extra whitespace
        answer = re.sub(r'\n\s*\n\s*\n+', '\n\n', answer)
        answer = answer.strip()
        
        # Add professional closing and organization signature if provided
        if organization_name:
            # Check if answer already ends with a polite closing
            answer_lower = answer.lower().strip()
            has_closing = any(phrase in answer_lower[-50:] for phrase in [
                "thank you", "thanks", "appreciate", "glad to help", 
                "hope this helps", "best regards"
            ])
            
            if not has_closing:
                answer = f"{answer}\n\nBest regards,\n{organization_name}"
            else:
                # Just ensure organization name is there
                if organization_name.lower() not in answer_lower:
                    answer = f"{answer}\n\nBest regards,\n{organization_name}"
        # No else clause - don't add anything if no organization name
        
        return answer

    @staticmethod
    def _extract_answer_from_context(question: str, context: str, max_sentences: int = 3) -> str:
        """Extract relevant answer from context with improved relevance scoring.
        
        Returns concise, professional answers (2-3 sentences max) without repeating the question.

        Args:
            question: User's question
            context: Retrieved document context
            max_sentences: Maximum number of sentences (default 3 for conciseness)
        """
        def split_into_sentences(text: str):
            # Improved sentence splitter that handles abbreviations
            # Split on sentence endings but preserve them
            sentences = re.split(r'(?<=[.!?])\s+(?=[A-Z])', text)
            return [s.strip() for s in sentences if s.strip() and len(s.strip()) > 10]

        if not context or not context.strip():
            return ""

        sentences = split_into_sentences(context)
        if not sentences:
            return ""

        # Build keyword set from question (tokens longer than 2 chars for better matching)
        q_words = re.findall(r"\w+", question.lower())
        q_tokens = [w for w in q_words if len(w) > 2 and w not in ['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use', 'what', 'when', 'where', 'which']]
        q_set = set(q_tokens)
        
        # Identify question intent keywords (what the question is asking about)
        question_intent_keywords = []
        question_lower = question.lower()
        if any(word in question_lower for word in ["topic", "topics", "subject", "subjects"]):
            question_intent_keywords.extend(["topic", "subject", "theme", "about", "covers", "discusses"])
        if any(word in question_lower for word in ["skill", "skills", "ability", "abilities"]):
            question_intent_keywords.extend(["skill", "ability", "competence", "proficient", "expertise", "capable"])
        if any(word in question_lower for word in ["education", "degree", "qualification"]):
            question_intent_keywords.extend(["education", "degree", "qualification", "study", "university", "college", "semester"])
        if any(word in question_lower for word in ["who", "person", "name"]):
            question_intent_keywords.extend(["name", "person", "individual", "who"])
        question_intent_keywords = set(question_intent_keywords)

        # Score sentences by overlap with question tokens and intent keywords
        scored = []
        for s in sentences:
            s_lower = s.lower()
            # Count keyword matches
            overlap = sum(1 for t in q_set if t in s_lower)
            # Count intent keyword matches (higher weight)
            intent_matches = sum(1 for t in question_intent_keywords if t in s_lower)
            
            # Bonus for multiple matches
            if overlap > 0 or intent_matches > 0:
                score = overlap * 2 + intent_matches * 3  # Intent keywords weighted higher
                # Bonus for question words appearing at the start
                if any(s_lower.startswith(t) for t in q_set):
                    score += 1
                # Bonus for intent keywords in sentence
                if intent_matches > 0:
                    score += 2
                # Penalize very long sentences
                if len(s) > 150:
                    score = score * 0.8
                scored.append((score, s, overlap, intent_matches))
            else:
                scored.append((0, s, 0, 0))

        # Sort descending by score
        scored.sort(key=lambda x: x[0], reverse=True)

        # Pick top sentences with positive score, prioritizing intent matches
        # First try to get sentences with intent keyword matches
        selected = [s for sc, s, ov, im in scored if im > 0][:max_sentences]
        if not selected or len(selected) < max_sentences:
            # Add sentences with high keyword overlap
            remaining = max_sentences - len(selected)
            additional = [s for sc, s, ov, im in scored if sc > 0 and s not in selected][:remaining]
            selected.extend(additional)
        
        if not selected:
            # Fallback: choose sentences with at least one keyword match
            selected = [s for sc, s, ov, im in scored if ov > 0][:max_sentences]
            if not selected:
                selected = sentences[:max_sentences]

        # Join and return concise answer (2-3 sentences max)
        answer = ' '.join(selected).strip()
        
        # Clean up answer: Remove question repetition and improve quality
        answer = AdvancedRAGSystem._clean_answer(answer, question)
        
        # Ensure answer is meaningful but concise
        if len(answer) < 20:
            # If answer is too short, try to get more context
            answer = ' '.join(sentences[:max_sentences]).strip()
            answer = AdvancedRAGSystem._clean_answer(answer, question)
        
        # Limit to 2-3 sentences maximum for professional, concise responses
        # Trim to reasonable length (max 400 characters for 2-3 sentences)
        if len(answer) > 400:
            # Try to cut at sentence boundary
            truncated = answer[:400]
            last_period = truncated.rfind('.')
            if last_period > 200:
                answer = truncated[:last_period + 1]
            else:
                # If no good sentence boundary, just truncate
                answer = truncated.rstrip() + '...'
        
        return answer
    
    @staticmethod
    def _clean_answer(answer: str, question: str) -> str:
        """Clean answer to remove question repetition, questions, and improve quality"""
        if not answer:
            return answer
        
        # Remove common question repetition patterns
        question_lower = question.lower().strip()
        answer_lower = answer.lower()
        
        # Remove if answer starts with the question
        if answer_lower.startswith(question_lower):
            # Find where question ends and answer begins
            answer = answer[len(question):].strip()
            # Remove common separators
            answer = re.sub(r'^[:\-–—]\s*', '', answer)
        
        # Split into sentences and remove questions (sentences ending with ?)
        sentences = re.split(r'(?<=[.!?])\s+', answer)
        cleaned_sentences = []
        question_words = set(re.findall(r'\w+', question_lower))
        
        for sent in sentences:
            sent = sent.strip()
            if not sent:
                continue
                
            # Remove sentences ending with question marks
            if sent.endswith('?'):
                # Check if it's a legitimate question that should be removed
                # Remove common question patterns
                question_patterns = [
                    r'would\s+you\s+like\s+to\s+know\s+more\?',
                    r'do\s+you\s+have\s+any\s+other\s+questions\?',
                    r'is\s+there\s+anything\s+else\s+you\s+would\s+like\s+to\s+know\?',
                    r'can\s+I\s+help\s+you\s+with\s+anything\s+else\?',
                    r'would\s+you\s+like\s+to\s+ask\s+another\s+question\?',
                    r'do\s+you\s+need\s+any\s+further\s+assistance\?',
                    r'are\s+there\s+any\s+other\s+questions\?',
                ]
                sent_lower = sent.lower()
                is_question_phrase = any(re.search(pattern, sent_lower) for pattern in question_patterns)
                if is_question_phrase:
                    continue  # Skip this question sentence
                # For other questions, convert to statement if possible, otherwise skip
                # Try to convert common question patterns to statements
                sent = re.sub(r'^would\s+you\s+like\s+to\s+know\s+more\?', 
                             'I can provide additional information if needed.', sent, flags=re.IGNORECASE)
                sent = re.sub(r'\?$', '.', sent)  # Replace trailing ? with .
            
            sent_lower = sent.lower()
            # Skip if sentence is too similar to question (more than 50% word overlap)
            sent_words = set(re.findall(r'\w+', sent_lower))
            if len(sent_words) > 0:
                overlap_ratio = len(question_words.intersection(sent_words)) / len(sent_words)
                if overlap_ratio < 0.5:  # Keep if less than 50% overlap
                    cleaned_sentences.append(sent)
                elif len(sent_words) > 5:  # Keep longer sentences even with some overlap
                    cleaned_sentences.append(sent)
            else:
                cleaned_sentences.append(sent)
        
        answer = ' '.join(cleaned_sentences).strip()
        
        # Remove common prefixes that repeat question
        prefixes_to_remove = [
            r'^regarding\s+your\s+question[:\-–—]?\s*',
            r'^to\s+answer\s+your\s+question[:\-–—]?\s*',
            r'^based\s+on\s+your\s+question[:\-–—]?\s*',
            r'^in\s+response\s+to[:\-–—]?\s*',
            r'^the\s+answer\s+to\s+your\s+question\s+is[:\-–—]?\s*',
        ]
        for prefix in prefixes_to_remove:
            answer = re.sub(prefix, '', answer, flags=re.IGNORECASE)
        
        # Remove any remaining question phrases
        question_phrases_to_remove = [
            r'would\s+you\s+like\s+to\s+know\s+more[\.\?]?',
            r'do\s+you\s+have\s+any\s+other\s+questions[\.\?]?',
            r'is\s+there\s+anything\s+else\s+you\s+would\s+like\s+to\s+know[\.\?]?',
            r'can\s+I\s+help\s+you\s+with\s+anything\s+else[\.\?]?',
        ]
        for phrase in question_phrases_to_remove:
            answer = re.sub(phrase, '', answer, flags=re.IGNORECASE)
        
        # Clean up extra whitespace
        answer = re.sub(r'\s+', ' ', answer).strip()
        
        return answer


def call_llm(prompt: str, max_tokens: int = 512) -> str:
    """Call configured external LLM provider (Grok/Groq API).

    Reads `GROK_API_KEY`, `GROK_ENDPOINT`, and `GROK_MODEL` from `settings` and sends a JSON
    payload in OpenAI-compatible format. Returns the textual output if present.
    
    Returns:
        str: The LLM response text
        
    Raises:
        RuntimeError: If provider is not configured or invalid
    """
    provider = getattr(settings, 'LLM_PROVIDER', '').strip().lower()
    if not provider:
        raise RuntimeError("No LLM_PROVIDER configured")

    if provider != 'grok':
        raise RuntimeError(f"LLM_PROVIDER must be 'grok' when using this deployment. Found: {provider}")

    api_key = getattr(settings, 'GROK_API_KEY', '')
    endpoint = getattr(settings, 'GROK_ENDPOINT', '')
    model = getattr(settings, 'GROK_MODEL', 'grok-beta')
    
    if not api_key or not endpoint:
        raise RuntimeError('Grok provider requires GROK_API_KEY and GROK_ENDPOINT in .env')

    # Log which model is being used
    logger.info(f"Calling Grok API with model: {model} at endpoint: {endpoint}")
    
    headers = {'Authorization': f'Bearer {api_key}', 'Content-Type': 'application/json'}
    
    # Check if endpoint is OpenAI-compatible (Groq API format)
    is_openai_format = 'openai' in endpoint.lower() or 'chat/completions' in endpoint.lower()
    
    if is_openai_format:
        # OpenAI-compatible format (Groq API)
        body = {
            'model': model,
            'messages': [
                {'role': 'user', 'content': prompt}
            ],
            'max_tokens': max_tokens,
            'temperature': 0.7
        }
    else:
        # Legacy format (direct prompt)
        body = {
            'prompt': prompt,
            'max_tokens': max_tokens
        }
        if model:
            body['model'] = model
    
    try:
        resp = requests.post(endpoint, json=body, headers=headers, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        
        if isinstance(data, dict):
            # OpenAI-compatible response format
            if 'choices' in data and len(data['choices']) > 0:
                return data['choices'][0].get('message', {}).get('content', '').strip()
            # Legacy response formats
            return data.get('text') or data.get('output') or data.get('response') or json.dumps(data)
        # If data is not a dict, coerce to string
        return str(data)
    except requests.exceptions.HTTPError as e:
        error_msg = f"HTTP {e.response.status_code} error"
        if e.response.status_code == 400:
            try:
                error_detail = e.response.json()
                error_msg += f": {error_detail}"
            except:
                error_msg += f": {e.response.text}"
        logger.error(f"LLM API call failed: {error_msg}")
        raise RuntimeError(f"LLM API call failed: {error_msg}")
    except Exception as e:
        logger.error(f"LLM API call error: {str(e)}")
        raise
    
    


# Initialize RAG system
def get_rag_system(db: psycopg2.extensions.connection = Depends(get_db)) -> AdvancedRAGSystem:
    """Get RAG system instance"""
    rag = AdvancedRAGSystem(db)
    rag.ensure_tables_exist()
    return rag


@router.post("/chat/upload-documents")
async def upload_documents(
    files: List[UploadFile] = File(...),
    current_user: dict = Depends(get_current_user),
    rag: AdvancedRAGSystem = Depends(get_rag_system)
):
    """Upload and process documents for RAG"""
    results = []

    for file in files:
        try:
            # Read file bytes immediately (UploadFile will be closed after request)
            contents = await file.read()

            # Create document record in DB with processing status
            document_id = str(uuid.uuid4())
            # Convert user_id to string (RAG tables use VARCHAR)
            user_id_str = str(current_user['id']) if isinstance(current_user['id'], int) else current_user['id']
            cursor = rag.db.cursor()
            cursor.execute("""
                INSERT INTO rag_documents
                (document_id, user_id, filename, file_size, processing_status, embedding_model)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, [document_id, user_id_str, file.filename, len(contents), 'processing', rag.embedding_model.model_name])
            rag.db.commit()

            # Schedule background processing (do not await)
            async def _bg():
                try:
                    await rag._process_bytes(document_id, contents, file.filename, user_id_str)
                except Exception as e:
                    logger.error(f"Background task error for {document_id}: {e}")

            asyncio.create_task(_bg())

            results.append({"document_id": document_id, "filename": file.filename, "status": "processing"})
        except Exception as e:
            logger.error(f"Upload failed for {file.filename}: {e}")
            results.append({"filename": file.filename, "status": "failed", "error": str(e)})

    return {"uploaded_documents": results}


@router.post("/chat/rag")
async def rag_chat(
    question: str = Form(...),
    context: str = Form("documents"),
    language: str = Form("en-US"),
    documents: Optional[str] = Form(None),  # JSON array of document IDs
    top_k: int = Form(5),
    similarity_threshold: float = Form(0.3),
    current_user: dict = Depends(get_current_user),
    rag: AdvancedRAGSystem = Depends(get_rag_system),
    db: psycopg2.extensions.connection = Depends(get_db)
):
    """RAG-based chat endpoint with context-aware responses
    
    Context modes:
    - 'documents': Search in uploaded documents using RAG
    - 'general': General organizational questions for employees
    """
    
    try:
        # Validate context
        valid_contexts = ["documents", "general"]
        if context not in valid_contexts:
            context = "general"  # Default to general
        
        # Be tolerant when parsing the `documents` form field. It may be:
        # - a JSON array string -> '["id1","id2"]'
        # - a Python literal list -> "['id1','id2']"
        # - a comma-separated string -> 'id1,id2'
        # - already a list (if client sent as multipart/form-data array)
        document_ids = None
        if documents:
            if isinstance(documents, list):
                document_ids = documents
            elif isinstance(documents, str):
                raw = documents.strip()
                if not raw:
                    document_ids = None
                else:
                    # Try JSON
                    try:
                        document_ids = json.loads(raw)
                    except Exception:
                        # Try Python literal eval
                        try:
                            document_ids = ast.literal_eval(raw)
                        except Exception:
                            # Fallback: split by comma
                            if ',' in raw:
                                document_ids = [s.strip() for s in raw.split(',') if s.strip()]
                            else:
                                # Single id string
                                document_ids = [raw]
            else:
                # Unknown type: coerce to list
                document_ids = [str(documents)]
        else:
            document_ids = None
        
        # Convert user_id to string if it's an integer
        user_id_str = str(current_user['id']) if isinstance(current_user['id'], int) else current_user['id']
        
        # Get organization name
        organization_name = None
        if current_user.get('organization_id'):
            try:
                cursor = db.cursor(cursor_factory=RealDictCursor)
                cursor.execute("SELECT name FROM organizations WHERE id = %s", (current_user['organization_id'],))
                org_row = cursor.fetchone()
                if org_row:
                    organization_name = org_row['name']
                cursor.close()
            except Exception as e:
                logger.debug(f"Error fetching organization name: {e}")
        
        result = await rag.rag_chat(
            question=question,
            user_id=user_id_str,
            context=context,
            document_ids=document_ids,
            top_k=top_k,
            similarity_threshold=similarity_threshold,
            organization_name=organization_name
        )
        
        return RAGChatResponse(**result)
    
    except Exception as e:
        logger.error(f"RAG chat error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/chat/user-documents")
async def get_user_documents(
    current_user: dict = Depends(get_current_user),
    db: psycopg2.extensions.connection = Depends(get_db)
):
    """Get user's uploaded documents"""
    
    try:
        cursor = db.cursor(cursor_factory=RealDictCursor)
        
        # Convert user_id to string (RAG tables use VARCHAR)
        user_id_str = str(current_user['id']) if isinstance(current_user['id'], int) else current_user['id']
        cursor.execute("""
            SELECT document_id, filename, file_type, total_chunks, total_tokens,
                   upload_date, processing_status, file_size
            FROM rag_documents
            WHERE user_id = %s
            ORDER BY upload_date DESC
        """, [user_id_str])
        
        documents = cursor.fetchall()
        cursor.close()
        
        return {"documents": documents, "count": len(documents)}
    
    except Exception as e:
        logger.error(f"Error fetching user documents: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.delete("/chat/documents/{document_id}")
async def delete_document(
    document_id: str,
    current_user: dict = Depends(get_current_user),
    db: psycopg2.extensions.connection = Depends(get_db)
):
    """Delete a document and its embeddings"""
    
    try:
        cursor = db.cursor()
        
        # Verify ownership - convert user_id to string
        user_id_str = str(current_user['id']) if isinstance(current_user['id'], int) else current_user['id']
        cursor.execute(
            "SELECT document_id FROM rag_documents WHERE document_id = %s AND user_id = %s",
            [document_id, user_id_str]
        )
        
        if not cursor.fetchone():
            cursor.close()
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Delete document (cascades to chunks and embeddings)
        cursor.execute("DELETE FROM rag_documents WHERE document_id = %s", [document_id])
        db.commit()
        cursor.close()
        
        return {"message": "Document deleted successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting document: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/chat/document-stats")
async def get_document_stats(
    current_user: dict = Depends(get_current_user),
    db: psycopg2.extensions.connection = Depends(get_db)
):
    """Get statistics about user's documents"""
    
    try:
        cursor = db.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute("""
            SELECT 
                COUNT(*) as total_documents,
                SUM(total_chunks) as total_chunks,
                SUM(total_tokens) as total_tokens,
                SUM(file_size) as total_size,
                COUNT(CASE WHEN processing_status = 'completed' THEN 1 END) as completed_count,
                COUNT(CASE WHEN processing_status = 'processing' THEN 1 END) as processing_count,
                COUNT(CASE WHEN processing_status = 'failed' THEN 1 END) as failed_count
            FROM rag_documents
            WHERE user_id = %s
        """, [str(current_user['id']) if isinstance(current_user['id'], int) else current_user['id']])
        
        stats = cursor.fetchone()
        cursor.close()
        
        return stats or {
            "total_documents": 0,
            "total_chunks": 0,
            "total_tokens": 0,
            "total_size": 0,
            "completed_count": 0,
            "processing_count": 0,
            "failed_count": 0
        }
    
    except Exception as e:
        logger.error(f"Error getting document stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/chat/upload-organization-documents")
async def upload_organization_documents(
    files: List[UploadFile] = File(...),
    context: str = Form("general"),  # Only "general" is supported now
    current_user: dict = Depends(get_current_user),
):
    """Upload organization documents for employee information (Admin only)"""
    
    # Check if user is admin
    if current_user.get('role', '').lower() != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can upload organization documents"
        )
    
    # Validate context - only general is supported
    if context != "general":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only 'general' context is supported. Upload employee-focused documents here."
        )
    
    # Get the path to organization_documents folder
    backend_path = Path(__file__).parent.parent
    org_docs_path = backend_path / "organization_documents" / context
    
    # Ensure the directory exists
    org_docs_path.mkdir(parents=True, exist_ok=True)
    
    results = []
    
    for file in files:
        try:
            # Validate file type
            allowed_extensions = ['.pdf', '.txt', '.docx', '.doc']
            file_ext = Path(file.filename).suffix.lower()
            
            if file_ext not in allowed_extensions:
                results.append({
                    "filename": file.filename,
                    "status": "failed",
                    "error": f"File type not allowed. Allowed types: {', '.join(allowed_extensions)}"
                })
                continue
            
            # Read file content
            file_content = await file.read()
            
            # Save file to the appropriate folder
            file_path = org_docs_path / file.filename
            
            # If file exists, append timestamp to filename
            if file_path.exists():
                timestamp = int(time.time())
                name_without_ext = file_path.stem
                file_path = org_docs_path / f"{name_without_ext}_{timestamp}{file_ext}"
            
            # Write file
            with open(file_path, 'wb') as f:
                f.write(file_content)
            
            results.append({
                "filename": file.filename,
                "saved_as": file_path.name,
                "context": context,
                "status": "success",
                "file_size": len(file_content)
            })
            
            logger.info(f"Admin {current_user['email']} uploaded organization document: {file.filename} to {context} context")
        
        except Exception as e:
            logger.error(f"Error uploading organization document {file.filename}: {e}")
            results.append({
                "filename": file.filename,
                "status": "failed",
                "error": str(e)
            })
    
    return {
        "message": "Organization documents uploaded successfully",
        "uploaded_documents": results
    }
