"""
Advanced Document Processing and Chunking System for RAG
Handles document extraction, preprocessing, and intelligent chunking
"""

import PyPDF2
import docx
import re
import logging
from typing import List, Tuple, Optional, Dict, Any
from io import BytesIO
import tiktoken

logger = logging.getLogger(__name__)


class TextPreprocessor:
    """Preprocesses text for better chunking and embedding"""
    
    @staticmethod
    def clean_text(text: str) -> str:
        """Clean and normalize text"""
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        # Remove control characters
        text = ''.join(char for char in text if ord(char) >= 32 or char in '\n\t')
        # Remove URLs if needed (optional)
        text = re.sub(r'http\S+|www\S+', '', text)
        return text.strip()
    
    @staticmethod
    def split_by_paragraphs(text: str) -> List[str]:
        """Split text into paragraphs"""
        paragraphs = text.split('\n\n')
        return [p.strip() for p in paragraphs if p.strip()]
    
    @staticmethod
    def split_by_sentences(text: str) -> List[str]:
        """Split text into sentences using regex"""
        # Match sentences ending with ., !, or ?
        sentences = re.split(r'(?<=[.!?])\s+', text)
        return [s.strip() for s in sentences if s.strip()]
    
    @staticmethod
    def count_tokens(text: str, model: str = "gpt2") -> int:
        """Estimate token count using tiktoken"""
        try:
            encoding = tiktoken.get_encoding("cl100k_base")
            tokens = encoding.encode(text)
            return len(tokens)
        except Exception as e:
            logger.warning(f"Token counting failed: {e}. Using approximate count.")
            return len(text.split())


class AdvancedDocumentChunker:
    """Advanced document chunking with semantic awareness"""
    
    def __init__(
        self,
        chunk_size: int = 512,
        chunk_overlap: int = 100,
        separator: str = "\n\n"
    ):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.separator = separator
        self.preprocessor = TextPreprocessor()
    
    def chunk_by_character_size(self, text: str) -> List[Tuple[str, int, int]]:
        """
        Chunk text by character size with overlap
        Returns: List of (chunk_text, start_char, end_char)
        """
        chunks = []
        start = 0
        
        while start < len(text):
            # Find end position
            end = start + self.chunk_size
            
            # Try to break at sentence boundary if possible
            if end < len(text):
                # Look for sentence ending near chunk boundary
                sentence_end = text.rfind('.', start, end)
                if sentence_end > start + self.chunk_size * 0.7:  # Only if within 70% of chunk
                    end = sentence_end + 1
                else:
                    # Fall back to last space
                    space_pos = text.rfind(' ', start, end)
                    if space_pos > start:
                        end = space_pos
            
            chunk_text = text[start:end].strip()
            if chunk_text:
                chunks.append((chunk_text, start, end))
            
            # Move start position with overlap
            start = end - self.chunk_overlap if end < len(text) else len(text)
        
        return chunks
    
    def chunk_by_semantic_units(self, text: str) -> List[Tuple[str, int, int]]:
        """
        Chunk text by semantic units (paragraphs, then sentences)
        Better for maintaining context
        """
        chunks = []
        current_chunk = ""
        start_pos = 0
        char_count = 0
        
        # Split by paragraphs first
        paragraphs = self.preprocessor.split_by_paragraphs(text)
        
        for para_idx, paragraph in enumerate(paragraphs):
            # Calculate start position in original text
            para_start = text.find(paragraph, char_count)
            if para_start == -1:
                para_start = char_count
            
            if not current_chunk:
                start_pos = para_start
            
            # Check if adding this paragraph would exceed chunk size
            combined = current_chunk + "\n\n" + paragraph if current_chunk else paragraph
            combined_tokens = self.preprocessor.count_tokens(combined)
            
            if combined_tokens > self.chunk_size and current_chunk:
                # Save current chunk
                chunks.append((current_chunk.strip(), start_pos, para_start))
                current_chunk = paragraph
                start_pos = para_start
            else:
                current_chunk = combined
            
            char_count = para_start + len(paragraph)
        
        # Add remaining chunk
        if current_chunk:
            chunks.append((current_chunk.strip(), start_pos, char_count))
        
        return chunks
    
    def chunk_document(self, text: str, strategy: str = "semantic") -> List[Dict[str, Any]]:
        """
        Chunk document using specified strategy
        Returns list of chunks with metadata
        """
        text = self.preprocessor.clean_text(text)
        
        if strategy == "character":
            chunk_tuples = self.chunk_by_character_size(text)
        else:  # semantic
            chunk_tuples = self.chunk_by_semantic_units(text)
        
        chunks = []
        for idx, (chunk_text, start_char, end_char) in enumerate(chunk_tuples):
            token_count = self.preprocessor.count_tokens(chunk_text)
            chunks.append({
                "content": chunk_text,
                "chunk_index": idx,
                "start_char": start_char,
                "end_char": end_char,
                "tokens_count": token_count,
                "metadata": {
                    "chunk_size_strategy": strategy,
                    "word_count": len(chunk_text.split())
                }
            })
        
        return chunks


class AdvancedDocumentProcessor:
    """Advanced document processor with chunking support"""
    
    def __init__(self):
        self.chunker = AdvancedDocumentChunker()
        self.preprocessor = TextPreprocessor()
    
    @staticmethod
    async def extract_text_from_pdf(file_content: bytes) -> str:
        """Extract text from PDF with better handling"""
        try:
            pdf_file = BytesIO(file_content)
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            text = ""
            
            for page_num, page in enumerate(pdf_reader.pages):
                page_text = page.extract_text()
                # Add metadata about page
                text += f"\n[Page {page_num + 1}]\n{page_text}\n"
            
            return text
        except Exception as e:
            logger.error(f"PDF extraction error: {e}")
            raise ValueError(f"Failed to extract PDF content: {str(e)}")
    
    @staticmethod
    async def extract_text_from_docx(file_content: bytes) -> str:
        """Extract text from DOCX"""
        try:
            docx_file = BytesIO(file_content)
            doc = docx.Document(docx_file)
            text = ""
            
            for para in doc.paragraphs:
                if para.text.strip():
                    text += para.text + "\n"
            
            return text
        except Exception as e:
            logger.error(f"DOCX extraction error: {e}")
            raise ValueError(f"Failed to extract DOCX content: {str(e)}")
    
    @staticmethod
    async def extract_text_from_txt(file_content: bytes) -> str:
        """Extract text from TXT"""
        try:
            text = file_content.decode('utf-8', errors='ignore')
            return text
        except Exception as e:
            logger.error(f"TXT extraction error: {e}")
            raise ValueError(f"Failed to extract TXT content: {str(e)}")
    
    async def process_file(self, file_content: bytes, filename: str) -> Tuple[str, str]:
        """
        Process file and return (extracted_text, file_type)
        """
        file_ext = filename.lower().split('.')[-1]
        
        if file_ext == 'pdf':
            text = await self.extract_text_from_pdf(file_content)
        elif file_ext in ['docx', 'doc']:
            text = await self.extract_text_from_docx(file_content)
        elif file_ext == 'txt':
            text = await self.extract_text_from_txt(file_content)
        else:
            raise ValueError(f"Unsupported file type: {file_ext}")
        
        return text, file_ext
    
    def chunk_text(self, text: str, strategy: str = "semantic") -> List[Dict[str, Any]]:
        """
        Chunk extracted text for RAG
        """
        return self.chunker.chunk_document(text, strategy=strategy)
    
    async def process_file_for_rag(
        self,
        file_content: bytes,
        filename: str,
        chunking_strategy: str = "semantic"
    ) -> Tuple[List[Dict[str, Any]], str]:
        """
        Complete pipeline: extract + chunk
        Returns: (chunks, file_type)
        """
        # Extract text
        text, file_type = await self.process_file(file_content, filename)
        
        # Chunk document
        chunks = self.chunk_text(text, strategy=chunking_strategy)
        
        logger.info(
            f"Processed {filename}: {len(chunks)} chunks, "
            f"Total tokens: {sum(c['tokens_count'] for c in chunks)}"
        )
        
        return chunks, file_type


# Singleton instance
document_processor = AdvancedDocumentProcessor()
