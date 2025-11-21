"""
Document processing module for extracting text from uploaded files
"""
import os
import PyPDF2
from io import BytesIO
from fastapi import UploadFile
import logging

logger = logging.getLogger(__name__)

class DocumentProcessor:
    """Handles document processing and text extraction"""
    
    ALLOWED_TYPES = {'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'}
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
    
    @staticmethod
    async def extract_text_from_pdf(file_content: bytes) -> str:
        """Extract text from PDF file"""
        try:
            pdf_reader = PyPDF2.PdfReader(BytesIO(file_content))
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            return text.strip()
        except Exception as e:
            logger.error(f"Error extracting text from PDF: {str(e)}")
            return ""
    
    @staticmethod
    async def extract_text_from_docx(file_content: bytes) -> str:
        """Extract text from DOCX file"""
        try:
            from docx import Document
            doc = Document(BytesIO(file_content))
            text = "\n".join([para.text for para in doc.paragraphs])
            return text.strip()
        except Exception as e:
            logger.error(f"Error extracting text from DOCX: {str(e)}")
            return ""
    
    @staticmethod
    async def extract_text_from_txt(file_content: bytes) -> str:
        """Extract text from TXT file"""
        try:
            return file_content.decode('utf-8').strip()
        except Exception as e:
            logger.error(f"Error reading TXT file: {str(e)}")
            return ""
    
    @classmethod
    async def process_file(cls, file: UploadFile) -> tuple[str, str]:
        """
        Process uploaded file and extract text
        Returns: (extracted_text, filename)
        """
        # Validate file type
        if file.content_type not in cls.ALLOWED_TYPES:
            raise ValueError(f"Unsupported file type: {file.content_type}")
        
        # Read file content
        content = await file.read()
        
        # Validate file size
        if len(content) > cls.MAX_FILE_SIZE:
            raise ValueError(f"File too large. Maximum size is {cls.MAX_FILE_SIZE / 1024 / 1024}MB")
        
        # Extract text based on file type
        text = ""
        if file.content_type == 'application/pdf':
            text = await cls.extract_text_from_pdf(content)
        elif file.content_type == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            text = await cls.extract_text_from_docx(content)
        elif file.content_type == 'text/plain':
            text = await cls.extract_text_from_txt(content)
        
        return text, file.filename
    
    @staticmethod
    def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> list:
        """
        Split text into chunks for better processing
        """
        chunks = []
        words = text.split()
        current_chunk = []
        current_size = 0
        
        for word in words:
            current_chunk.append(word)
            current_size += len(word) + 1
            
            if current_size >= chunk_size:
                chunks.append(' '.join(current_chunk))
                # Keep some overlap
                if len(current_chunk) > overlap:
                    current_chunk = current_chunk[-overlap:]
                    current_size = sum(len(w) + 1 for w in current_chunk)
                else:
                    current_chunk = []
                    current_size = 0
        
        if current_chunk:
            chunks.append(' '.join(current_chunk))
        
        return chunks
