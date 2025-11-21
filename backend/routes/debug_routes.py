from fastapi import APIRouter, Depends, HTTPException
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Any, Dict
from backend.auth_utils import get_db, get_current_user

router = APIRouter()


@router.get("/internal/rag/debug/{user_id}")
def rag_debug(user_id: int, db: psycopg2.extensions.connection = Depends(get_db)) -> Dict[str, Any]:
    """Return quick debug info for RAG tables for a given user_id.

    This endpoint is intended for debugging only and should be protected or removed in production.
    """
    try:
        cursor = db.cursor(cursor_factory=RealDictCursor)

        # Counts
        cursor.execute("SELECT COUNT(*) as count FROM rag_documents WHERE user_id = %s", (user_id,))
        docs_count = cursor.fetchone()["count"]

        cursor.execute("SELECT COUNT(*) as count FROM rag_document_chunks WHERE document_id IN (SELECT document_id FROM rag_documents WHERE user_id = %s)", (user_id,))
        chunks_count = cursor.fetchone()["count"]

        cursor.execute("SELECT COUNT(*) as count FROM rag_embeddings WHERE document_id IN (SELECT document_id FROM rag_documents WHERE user_id = %s)", (user_id,))
        emb_count = cursor.fetchone()["count"]

        # Recent documents
        cursor.execute("SELECT document_id, filename, processing_status, total_chunks, total_tokens, upload_date FROM rag_documents WHERE user_id = %s ORDER BY upload_date DESC LIMIT 10", (user_id,))
        recent_docs = cursor.fetchall()

        # Sample chunks (for first recent document)
        sample_chunks = []
        sample_embeddings = []
        if recent_docs:
            first_doc_id = recent_docs[0]["document_id"]
            cursor.execute("SELECT chunk_id, chunk_index, tokens_count, substr(content,1,500) as snippet FROM rag_document_chunks WHERE document_id = %s ORDER BY chunk_index LIMIT 10", (first_doc_id,))
            sample_chunks = cursor.fetchall()

            cursor.execute("SELECT embedding_id, chunk_id, created_at FROM rag_embeddings WHERE document_id = %s LIMIT 10", (first_doc_id,))
            sample_embeddings = cursor.fetchall()

        cursor.close()

        return {
            "docs_count": docs_count,
            "chunks_count": chunks_count,
            "embeddings_count": emb_count,
            "recent_documents": recent_docs,
            "sample_chunks": sample_chunks,
            "sample_embeddings": sample_embeddings
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
