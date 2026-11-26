import { useRef, useState } from 'react';
import {
  DocumentEditorContainerComponent,
  Toolbar,
  Ribbon
} from '@syncfusion/ej2-react-documenteditor';
import defaultDocument from './defaultDocument.json';
import './App.css';

DocumentEditorContainerComponent.Inject(Toolbar, Ribbon);

const ALL_USERS = 'All Users';
const EDITOR_ALL = 'Everyone'; // name the editor uses internally for insertEditingRegion()

const USERS = [
  { name: ALL_USERS, color: '#FFFF00' },
  { name: 'Legal Reviewer', color: '#1E88E5' },
  { name: 'Finance User', color: '#43A047' },
  { name: 'Manager', color: '#FB8C00' },
  { name: 'Administrator', color: '#8E24AA' }
];
const SPECIFIC_USERS = USERS.slice(1);

const colorOf = (editorUser: string) =>
  USERS.find(u => u.name === (editorUser === EDITOR_ALL ? ALL_USERS : editorUser))?.color;

function App() {
  const containerRef = useRef<DocumentEditorContainerComponent | null>(null);

  const [currentUser, setCurrentUser] = useState(ALL_USERS);
  const [protectedDoc, setProtectedDoc] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [regionType, setRegionType] = useState<'all' | 'specific'>('all');
  const [dialogUsers, setDialogUsers] = useState<string[]>([SPECIFIC_USERS[0].name]);
  const [regionName, setRegionName] = useState('');
  const [message, setMessage] = useState('');

  const editor = () => containerRef.current?.documentEditor;

  const onCreated = () => {
    const de = editor();
    if (!de) return;
    de.open(defaultDocument.sfdt);
    de.currentUser = ALL_USERS;

    // Highlight each editable region with the colour of the user it belongs to.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sel = (de as any).selectionModule;
    const origInternal = sel.highlightEditRegionInternal;
    const origAdd = sel.addEditRegionHighlight;
    let regionUser: string | undefined;
    sel.highlightEditRegionInternal = function (start: { user: string }) {
      regionUser = start.user;
      try {
        return origInternal.call(this, start);
      } finally {
        regionUser = undefined;
      }
    };
    sel.addEditRegionHighlight = function (...args: unknown[]) {
      const info = origAdd.apply(this, args);
      const color = regionUser && colorOf(regionUser);
      if (info && color) info.color = color;
      return info;
    };
  };

  const openDialog = () => {
    const de = editor();
    if (!de) return;
    if (protectedDoc) {
      setMessage('Stop protection before inserting an editable region.');
      return;
    }
    const text = de.selection.text.replace(/\s+/g, ' ').trim();
    if (!text) {
      setMessage('Select a document section first.');
      return;
    }
    setRegionName(text.slice(0, 40));
    setMessage('');
    setDialogOpen(true);
  };

  const insertRegion = () => {
    const de = editor();
    if (!de) return;
    if (regionType === 'specific' && dialogUsers.length === 0) {
      setMessage('Select at least one user.');
      return;
    }
    const targets = regionType === 'all' ? [ALL_USERS] : dialogUsers;
    // The selection stays on the same content after each insert, so one
    // region is added per selected user over the same range.
    targets.forEach(user => {
      if (user === ALL_USERS) de.editor.insertEditingRegion();
      else de.editor.insertEditingRegion(user);
    });
    setMessage('');
    setDialogOpen(false);
  };

  const protect = () => {
    const de = editor();
    if (!de) return;
    de.editor.enforceProtection('', 'ReadOnly');
    de.currentUser = currentUser;
    setProtectedDoc(true);
  };

  const unprotect = () => {
    editor()?.editor.stopProtection('');
    setProtectedDoc(false);
  };

  const selectUser = (name: string) => {
    setCurrentUser(name);
    const de = editor();
    if (de) de.currentUser = name;
  };

  return (
    <div className="app">
      <div className="app-toolbar">
        <button onClick={openDialog} disabled={protectedDoc}>
          Insert Editable Region
        </button>
        {protectedDoc ? (
          <button onClick={unprotect}>Stop Protection</button>
        ) : (
          <button onClick={protect}>Protect (ReadOnly)</button>
        )}
        <span className="status">
          {protectedDoc ? 'Protected: ReadOnly' : 'Unprotected'} · Current user:{' '}
          <b>{currentUser}</b>
        </span>
        {message && <span className="message">{message}</span>}
      </div>

      <div className="app-body">
        <div className="editor-area">
          <DocumentEditorContainerComponent
            ref={containerRef}
            id="container"
            height="590px"
            serviceUrl="https://document.syncfusion.com/web-services/docx-editor/api/documenteditor/"
            enableToolbar={true}
            toolbarMode="Ribbon"
            created={onCreated}
          />
        </div>

        <aside className="side-panel">
          <h3>Users</h3>
          <ul className="users">
            {USERS.map(u => (
              <li key={u.name}>
                <button
                  className={u.name === currentUser ? 'active' : ''}
                  onClick={() => selectUser(u.name)}
                >
                  <span
                    className="user-badge"
                    style={{ backgroundColor: u.color }}
                    aria-hidden="true"
                  />
                  {u.name}
                </button>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      {dialogOpen && (
        <div className="overlay" role="dialog" aria-modal="true" aria-label="Insert Editable Region">
          <div className="dialog">
            <h3>Insert Editable Region</h3>
            <fieldset>
              <legend>Region Type</legend>
              <label>
                <input
                  type="radio"
                  name="type"
                  checked={regionType === 'all'}
                  onChange={() => setRegionType('all')}
                />{' '}
                <span
                  className="user-badge"
                  style={{ backgroundColor: USERS[0].color }}
                  aria-hidden="true"
                />
                All Users
              </label>
              <label>
                <input
                  type="radio"
                  name="type"
                  checked={regionType === 'specific'}
                  onChange={() => setRegionType('specific')}
                />{' '}
                Specific User(s)
              </label>
            </fieldset>
            <fieldset disabled={regionType !== 'specific'}>
              <legend>Users (select one or more)</legend>
              {SPECIFIC_USERS.map(u => (
                <label key={u.name}>
                  <input
                    type="checkbox"
                    checked={dialogUsers.includes(u.name)}
                    onChange={e =>
                      setDialogUsers(list =>
                        e.target.checked ? [...list, u.name] : list.filter(n => n !== u.name)
                      )
                    }
                  />{' '}
                  <span
                    className="user-badge"
                    style={{ backgroundColor: u.color }}
                    aria-hidden="true"
                  />
                  {u.name}
                </label>
              ))}
            </fieldset>
            <label className="field">
              Region name
              <input value={regionName} onChange={e => setRegionName(e.target.value)} />
            </label>
            <div className="actions">
              <button onClick={insertRegion}>Insert</button>
              <button onClick={() => setDialogOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;