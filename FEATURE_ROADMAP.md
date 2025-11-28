# DocuScan Feature Roadmap

Based on the minimal/industrial design direction, here are high-value features to elevate DocuScan to a production-grade tool.

## 1. Human-in-the-Loop Validation (Editable Results)
**Priority: High**
*   **Concept:** Implement inline editing for extracted data before export.
*   **Why:** OCR is rarely 100% perfect. Allowing users to fix typos (e.g., "9" vs "3") in the browser is a massive UX improvement.
*   **Implementation:** 
    *   **Table View:** Editable cells within the results grid.
    *   **Notes View:** Rich text or text area editing for extracted content.

## 2. Custom Extraction Schemas (Targeted OCR)
**Priority: Medium**
*   **Concept:** Allow users to define specific fields to extract instead of a generic "extract everything" approach.
*   **Example:** User inputs "Invoice No, Total, Date" -> System extracts only those fields.
*   **Why:** Essential for users processing specific document types repetitively.

## 3. Multi-Page PDF Support
**Priority: High**
*   **Concept:** Support for PDF uploads, converting pages to images for processing.
*   **Why:** Real-world documents (contracts, bank statements) are often multi-page PDFs, not just single images.

## 4. "Chat with your Document" (RAG-lite)
**Priority: Medium**
*   **Concept:** A chat interface to ask questions about the extracted data.
*   **Example:** "What is the average grade?" or "Summarize the key terms."
*   **Why:** Transforms the tool from a simple converter into an analysis platform.

## 5. Local History (Session Persistence)
**Priority: Low**
*   **Concept:** Save recent scans using `localStorage` or `IndexedDB`.
*   **Why:** Prevents data loss on accidental refreshes or browser crashes.

## 6. Smart Export Options
**Priority: Low**
*   **Concept:** Integrations with external tools.
*   **Options:** Google Sheets Sync, Webhook (JSON to URL).
*   **Why:** Automates post-extraction workflows for power users.
