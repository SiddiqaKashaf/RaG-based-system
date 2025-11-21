"""
Vector Embedding and Similarity Search System for RAG
Handles embedding generation, storage, and semantic similarity retrieval
"""

import numpy as np
import psycopg2
from psycopg2.extras import execute_values
from sentence_transformers import SentenceTransformer, util
import logging
from typing import List, Tuple, Optional, Dict, Any
import time
import uuid

logger = logging.getLogger(__name__)


class EmbeddingModel:
    """Manages embedding generation using Sentence Transformers"""
    
    # Pre-trained models for different use cases
    MODELS = {
        "all-MiniLM-L6-v2": "sentence-transformers/all-MiniLM-L6-v2",  # Fast, 384 dims
        "all-mpnet-base-v2": "sentence-transformers/all-mpnet-base-v2",  # Better quality, 768 dims
        "all-roberta-large-v1": "sentence-transformers/all-roberta-large-v1",  # High quality, 1024 dims
        "bge-base-en-v1.5": "BAAI/bge-base-en-v1.5",  # Bilingual, 768 dims
        "multilingual-MiniLM": "sentence-transformers/multilingual-MiniLM-L6-v2"  # Multi-language, 384 dims
    }
    
    _instance = None
    _models_cache = {}
    
    def __init__(self, model_name: str = "all-MiniLM-L6-v2", device: str = "cpu"):
        self.model_name = model_name
        self.model_path = self.MODELS.get(model_name, model_name)
        self.device = device
        self._load_model()
    
    def _load_model(self):
        """Load model with caching to avoid reloading"""
        if self.model_path not in self._models_cache:
            logger.info(f"Loading embedding model: {self.model_path}")
            try:
                self._models_cache[self.model_path] = SentenceTransformer(
                    self.model_path,
                    device=self.device
                )
                # Assign to instance before calling get_embedding_dim()
                self.model = self._models_cache[self.model_path]
                logger.info(f"Model loaded successfully. Embedding dimension: {self.get_embedding_dim()}")
            except Exception as e:
                logger.error(f"Failed to load model: {e}")
                raise
        else:
            # Use cached model
            self.model = self._models_cache[self.model_path]
    
    def get_embedding_dim(self) -> int:
        """Get embedding dimension"""
        return self.model.get_sentence_embedding_dimension()
    
    def embed_text(self, text: str) -> np.ndarray:
        """Generate embedding for single text"""
        return self.model.encode(text, convert_to_numpy=True)
    
    def embed_batch(self, texts: List[str]) -> np.ndarray:
        """Generate embeddings for multiple texts"""
        return self.model.encode(texts, convert_to_numpy=True, show_progress_bar=False)
    
    def embed_chunks(self, chunks: List[str]) -> List[List[float]]:
        """Embed chunks and return as lists of floats"""
        embeddings = self.embed_batch(chunks)
        return [embedding.tolist() for embedding in embeddings]
    
    def similarity(self, embedding1: np.ndarray, embedding2: np.ndarray) -> float:
        """Calculate cosine similarity between two embeddings"""
        return float(util.cos_sim(embedding1, embedding2)[0][0])


class VectorStore:
    """Vector storage and retrieval system using PostgreSQL + pgvector"""
    
    def __init__(self, db_connection):
        self.db = db_connection
        self.embedding_model = EmbeddingModel()
    
    def create_or_ensure_vector_table(self):
        """Create pgvector extension and embedding table"""
        try:
            cursor = self.db.cursor()
            
            # Create pgvector extension (if not using pgvector, we'll use array storage)
            try:
                cursor.execute("CREATE EXTENSION IF NOT EXISTS vector;")
                self.db.commit()
                logger.info("pgvector extension created/already exists")
            except psycopg2.Error as e:
                logger.warning(f"pgvector not available: {e}. Using FLOAT8[] instead")
                self.db.rollback()
            
            # Create RAG embeddings table using BYTEA to store serialized float32
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS rag_embeddings (
                    embedding_id VARCHAR(36) PRIMARY KEY,
                    chunk_id VARCHAR(36) NOT NULL,
                    document_id VARCHAR(36) NOT NULL,
                    user_id VARCHAR(36) NOT NULL,
                    embedding BYTEA NOT NULL,
                    embedding_model VARCHAR(100) DEFAULT 'all-MiniLM-L6-v2',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (document_id) REFERENCES rag_documents(document_id) ON DELETE CASCADE
                );
            """)
            
            self.db.commit()
            logger.info("Embeddings table created/already exists")
            cursor.close()
        except Exception as e:
            logger.error(f"Error creating vector table: {e}")
            raise
    
    def store_embeddings(
        self,
        embeddings: List[np.ndarray],
        chunk_ids: List[str],
        document_id: str,
        user_id: str
    ) -> bool:
        """Store embeddings in database"""
        try:
            cursor = self.db.cursor()
            data = [
                (
                    str(uuid.uuid4()),  # embedding_id
                    chunk_id,
                    document_id,
                    user_id,
                    embedding.astype('float32').tobytes(),  # store as bytes
                    self.embedding_model.model_name
                )
                for chunk_id, embedding in zip(chunk_ids, embeddings)
            ]
            
            execute_values(
                cursor,
                """
                INSERT INTO rag_embeddings 
                (embedding_id, chunk_id, document_id, user_id, embedding, embedding_model)
                VALUES %s
                """,
                data
            )
            
            self.db.commit()
            logger.info(f"Stored {len(embeddings)} embeddings for document {document_id}")
            cursor.close()
            return True
        except Exception as e:
            logger.error(f"Error storing embeddings: {e}")
            self.db.rollback()
            return False
    
    def similarity_search(
        self,
        query: str,
        document_ids: Optional[List[str]] = None,
        user_id: Optional[str] = None,
        top_k: int = 5,
        threshold: float = 0.3
    ) -> List[Tuple[str, str, str, float]]:
        """
        Semantic similarity search
        Returns: List of (chunk_id, document_id, content, similarity_score)
        """
        try:
            # Generate query embedding
            query_embedding = self.embedding_model.embed_text(query)
            
            cursor = self.db.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

            # Build SQL query to fetch candidate embeddings
            where_clauses = []
            params = []

            if user_id:
                # Ensure user_id is string (RAG tables use VARCHAR)
                user_id_str = str(user_id) if not isinstance(user_id, str) else user_id
                where_clauses.append("e.user_id = %s")
                params.append(user_id_str)

            if document_ids:
                where_clauses.append(f"e.document_id = ANY(%s)")
                params.append(document_ids)

            where_sql = " AND ".join(where_clauses) if where_clauses else "1=1"

            sql = f"""
                SELECT e.chunk_id, e.document_id, dc.content, e.embedding
                FROM rag_embeddings e
                JOIN rag_document_chunks dc ON e.chunk_id = dc.chunk_id
                WHERE {where_sql}
                LIMIT 1000
            """

            cursor.execute(sql, params)
            rows = cursor.fetchall()

            # Compute similarity in Python
            scored = []
            for row in rows:
                try:
                    emb_bytes = row['embedding']
                    emb_array = np.frombuffer(emb_bytes, dtype=np.float32)
                    sim = float(self.embedding_model.similarity(query_embedding, emb_array))
                    if sim > threshold:
                        scored.append((row['chunk_id'], row['document_id'], row['content'], sim))
                except Exception:
                    continue

            # Sort and return top_k (only high-quality matches)
            scored.sort(key=lambda x: x[3], reverse=True)
            # Filter for better quality - only return results with similarity > 0.3
            quality_results = [r for r in scored if r[3] > 0.3][:top_k]
            # If we have quality results, use them; otherwise use best available
            if quality_results:
                results = [dict(zip(['chunk_id', 'document_id', 'content', 'similarity_score'], r)) for r in quality_results]
            else:
                # Fallback: use top results even if below threshold
                results = [dict(zip(['chunk_id', 'document_id', 'content', 'similarity_score'], r)) for r in scored[:top_k]]
            cursor.close()
            return results
        
        except Exception as e:
            logger.error(f"Similarity search error: {e}")
            return []


class HybridRetriever:
    """Hybrid retrieval combining keyword and semantic search"""
    
    def __init__(self, db_connection):
        self.vector_store = VectorStore(db_connection)
        self.db = db_connection
    
    def keyword_search(
        self,
        query: str,
        document_ids: Optional[List[str]] = None,
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """Simple keyword-based search"""
        try:
            cursor = self.db.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            
            keywords = query.lower().split()
            
            where_clause = "LOWER(dc.content) LIKE ANY(%s)"
            params = [[f"%{kw}%" for kw in keywords]]
            
            if document_ids:
                where_clause += " AND dc.document_id = ANY(%s)"
                params.append(document_ids)
            
            cursor.execute(
                f"""
                SELECT dc.chunk_id, dc.document_id, dc.content, dc.chunk_index
                FROM rag_document_chunks dc
                WHERE {where_clause}
                LIMIT %s
                """,
                params + [top_k]
            )
            
            results = cursor.fetchall()
            cursor.close()
            return results
        except Exception as e:
            logger.error(f"Keyword search error: {e}")
            return []
    
    def hybrid_search(
        self,
        query: str,
        document_ids: Optional[List[str]] = None,
        user_id: Optional[str] = None,
        top_k: int = 5,
        semantic_weight: float = 0.7
    ) -> List[Dict[str, Any]]:
        """Combine keyword and semantic search"""
        # Semantic search (70% weight)
        semantic_results = self.vector_store.similarity_search(
            query, document_ids, user_id, top_k
        )
        
        # Keyword search (30% weight)
        keyword_results = self.keyword_search(query, document_ids, top_k)
        
        # Combine results with weighted scoring
        combined = {}
        
        # semantic_results may be a list of dicts from similarity_search
        for i, item in enumerate(semantic_results):
            try:
                if isinstance(item, dict):
                    chunk_id = item.get('chunk_id')
                    doc_id = item.get('document_id')
                    content = item.get('content')
                    similarity = item.get('similarity_score', 0)
                else:
                    # legacy tuple form
                    chunk_id, doc_id, content, similarity = item

                score = (similarity or 0) * semantic_weight
                combined[chunk_id] = {
                    'chunk_id': chunk_id,
                    'document_id': doc_id,
                    'content': content,
                    'score': score,
                    'source': 'semantic'
                }
            except Exception:
                continue
        
        keyword_weight = (1 - semantic_weight)
        for i, result in enumerate(keyword_results):
            chunk_id = result['chunk_id']
            score = (1 - i / len(keyword_results)) * keyword_weight  # Ranking-based score
            
            if chunk_id in combined:
                combined[chunk_id]['score'] += score
                combined[chunk_id]['source'] = 'hybrid'
            else:
                combined[chunk_id] = {
                    'chunk_id': chunk_id,
                    'document_id': result['document_id'],
                    'content': result['content'],
                    'score': score,
                    'source': 'keyword'
                }
        
        # If semantic+keyword produced nothing (e.g., no embeddings yet), fall back to keyword results
        if not combined and keyword_results:
            # convert keyword_results rows to expected dict format
            fallback = []
            for r in keyword_results[:top_k]:
                fallback.append({
                    'chunk_id': r.get('chunk_id'),
                    'document_id': r.get('document_id'),
                    'content': r.get('content'),
                    'score': 0.1,  # low base score for keyword-only
                    'source': 'keyword'
                })
            return fallback

        # Sort by score
        sorted_results = sorted(combined.values(), key=lambda x: x['score'], reverse=True)[:top_k]

        return sorted_results
