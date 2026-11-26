# React DOCX Editor - Editable Regions

This sample demonstrates how to insert editable regions in protected documents using the Syncfusion® React DOCX Editor.

Editable regions allow specific sections of a document to remain editable while protecting the remaining content from modifications. You can create editable regions for all users or restrict editing access to specific users.

## Getting Started

### Clone the Repository

```bash
git clone https://github.com/SyncfusionExamples/react-docx-editor-editable-regions.git
cd react-docx-editor-editable-regions
```

### Run the Application

```bash
npm install
npm run dev
```

Open the application in your browser using the URL displayed in the terminal.

## Implementation

The sample shows how to:

- Insert editable regions for all users.
- Insert editable regions for specific users.
- Set the current user.
- Protect a document in ReadOnly mode.
- Allow editing only within designated editable regions.

## Output

After the document is protected:

- Regions created for all users can be edited by anyone.
- Regions assigned to a specific user can only be edited by that user.
- All other document content remains protected from modification.
