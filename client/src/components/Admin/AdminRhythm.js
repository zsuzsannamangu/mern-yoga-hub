import React, { useEffect, useState, useCallback } from 'react';
import AdminLayout from './AdminLayout';
import './AdminRhythm.scss';
import Swal from 'sweetalert2';
import '@sweetalert2/theme-material-ui/material-ui.css';
import { FaTrash } from 'react-icons/fa';
import {
    createDefaultRhythmDocument,
    rid,
    inferSectionBand,
    RHYTHM_BAND_LABELS,
} from './adminRhythmDefaults';

const LS_KEY = 'yogasavor_admin_rhythm_v1';

function loadDocument() {
    try {
        const raw = localStorage.getItem(LS_KEY);
        if (!raw) return createDefaultRhythmDocument();
        const parsed = JSON.parse(raw);
        if (!parsed || !Array.isArray(parsed.sections)) return createDefaultRhythmDocument();
        return parsed;
    } catch {
        return createDefaultRhythmDocument();
    }
}

export default function AdminRhythm() {
    const [doc, setDoc] = useState(() => loadDocument());

    useEffect(() => {
        const t = setTimeout(() => {
            try {
                localStorage.setItem(LS_KEY, JSON.stringify(doc));
            } catch {
                /* ignore quota */
            }
        }, 250);
        return () => clearTimeout(t);
    }, [doc]);

    const updateSection = useCallback((sectionId, updater) => {
        setDoc((d) => ({
            ...d,
            sections: d.sections.map((s) => (s.id === sectionId ? updater(s) : s)),
        }));
    }, []);

    const setColumn = (sectionId, colIndex, value) => {
        updateSection(sectionId, (s) => {
            const columns = [...s.columns];
            columns[colIndex] = value;
            return { ...s, columns };
        });
    };

    const setCell = (sectionId, rowId, colIndex, value) => {
        updateSection(sectionId, (s) => ({
            ...s,
            rows: s.rows.map((r) =>
                r.id === rowId
                    ? {
                          ...r,
                          cells: r.cells.map((c, i) => (i === colIndex ? value : c)),
                      }
                    : r
            ),
        }));
    };

    const setSectionTitle = (sectionId, title) => {
        updateSection(sectionId, (s) => ({ ...s, title }));
    };

    const setSectionNote = (sectionId, note) => {
        updateSection(sectionId, (s) => ({ ...s, note }));
    };

    const addRow = (sectionId) => {
        updateSection(sectionId, (s) => ({
            ...s,
            rows: [...s.rows, { id: rid(), cells: s.columns.map(() => '') }],
        }));
    };

    const deleteRow = (sectionId, rowId) => {
        updateSection(sectionId, (s) => ({
            ...s,
            rows: s.rows.filter((r) => r.id !== rowId),
        }));
    };

    const deleteSection = (sectionId) => {
        setDoc((d) => ({
            ...d,
            sections: d.sections.filter((s) => s.id !== sectionId),
        }));
    };

    const addSection = () => {
        setDoc((d) => {
            const last = d.sections[d.sections.length - 1];
            const band = last ? inferSectionBand(last) : 'weekly';
            const newSection = {
                id: `sec_${Date.now()}`,
                title: 'New section',
                note: '',
                band,
                columns: ['Column 1', 'Column 2', 'Column 3'],
                rows: [{ id: rid(), cells: ['', '', ''] }],
            };
            return { ...d, sections: [...d.sections, newSection] };
        });
    };

    const confirmReset = async () => {
        const res = await Swal.fire({
            title: 'Reset everything?',
            text: 'This replaces your rhythm plan with the default template. Your edits will be lost.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Reset',
            cancelButtonText: 'Cancel',
        });
        if (res.isConfirmed) {
            const fresh = createDefaultRhythmDocument();
            setDoc(fresh);
            try {
                localStorage.setItem(LS_KEY, JSON.stringify(fresh));
            } catch {
                /* ignore */
            }
            Swal.fire({ title: 'Reset', text: 'Defaults loaded.', icon: 'success', timer: 1600, showConfirmButton: false });
        }
    };

    const confirmDeleteSection = async (sectionId, title) => {
        const res = await Swal.fire({
            title: 'Delete this section?',
            text: title || sectionId,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
        });
        if (res.isConfirmed) deleteSection(sectionId);
    };

    const confirmDeleteRow = async (sectionId, rowId) => {
        const res = await Swal.fire({
            title: 'Delete this row?',
            text: 'This cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
        });
        if (res.isConfirmed) deleteRow(sectionId, rowId);
    };

    return (
        <AdminLayout>
            <div className="admin-rhythm">
                <div className="admin-rhythm__header">
                    <div>
                        <h1>Rhythm &amp; schedule</h1>
                        <p>
                            Your weekly rhythm, monthly themes, and output targets. Edits save automatically in this
                            browser. Use <strong>Reset</strong> to restore the template from scratch.
                        </p>
                    </div>
                    <div className="admin-rhythm__actions">
                        <button type="button" className="admin-rhythm__btn admin-rhythm__btn--ghost" onClick={addSection}>
                            + Section
                        </button>
                        <button type="button" className="admin-rhythm__btn admin-rhythm__btn--danger" onClick={confirmReset}>
                            Reset to defaults
                        </button>
                    </div>
                </div>

                {doc.sections.map((section, idx) => {
                    const band = inferSectionBand(section);
                    const prevBand = idx > 0 ? inferSectionBand(doc.sections[idx - 1]) : null;
                    const showBand = prevBand !== band;

                    return (
                        <React.Fragment key={section.id}>
                            {showBand && (
                                <div className="admin-rhythm__band" role="presentation">
                                    <span className="admin-rhythm__band-label">{RHYTHM_BAND_LABELS[band]}</span>
                                </div>
                            )}
                            <section
                                className={`admin-rhythm__section admin-rhythm__section--${band}`}
                            >
                                <div className="admin-rhythm__section-head">
                                    <input
                                        type="text"
                                        className="admin-rhythm__title-input"
                                        value={section.title}
                                        onChange={(e) => setSectionTitle(section.id, e.target.value)}
                                        aria-label="Section title"
                                    />
                                    <div className="admin-rhythm__section-actions">
                                        <button
                                            type="button"
                                            className="admin-rhythm__btn admin-rhythm__btn--ghost"
                                            onClick={() => addRow(section.id)}
                                        >
                                            + Row
                                        </button>
                                        <button
                                            type="button"
                                            className="admin-rhythm__icon-btn admin-rhythm__icon-btn--danger"
                                            title="Delete section"
                                            aria-label="Delete section"
                                            onClick={() => confirmDeleteSection(section.id, section.title)}
                                        >
                                            <FaTrash aria-hidden />
                                        </button>
                                    </div>
                                </div>

                                <textarea
                                    className="admin-rhythm__note"
                                    placeholder="Optional notes for this block (e.g. Week B reminders)…"
                                    value={section.note || ''}
                                    onChange={(e) => setSectionNote(section.id, e.target.value)}
                                />

                                <div className="admin-rhythm__table-wrap">
                                    <table className="admin-rhythm__table">
                                        <thead>
                                            <tr>
                                                {section.columns.map((col, ci) => (
                                                    <th key={ci}>
                                                        <input
                                                            className="admin-rhythm__col-head"
                                                            value={col}
                                                            onChange={(e) => setColumn(section.id, ci, e.target.value)}
                                                            aria-label={`Column ${ci + 1}`}
                                                        />
                                                    </th>
                                                ))}
                                                <th className="admin-rhythm__row-actions" aria-label="Row actions" />
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {section.rows.length === 0 ? (
                                                <tr>
                                                    <td
                                                        colSpan={section.columns.length + 1}
                                                        style={{ color: '#5a6c7d', fontStyle: 'italic' }}
                                                    >
                                                        No rows yet — click + Row.
                                                    </td>
                                                </tr>
                                            ) : (
                                                section.rows.map((row) => (
                                                    <tr key={row.id}>
                                                        {section.columns.map((_, ci) => (
                                                            <td key={ci}>
                                                                <input
                                                                    className="admin-rhythm__cell"
                                                                    value={row.cells[ci] ?? ''}
                                                                    onChange={(e) =>
                                                                        setCell(section.id, row.id, ci, e.target.value)
                                                                    }
                                                                />
                                                            </td>
                                                        ))}
                                                        <td className="admin-rhythm__row-actions">
                                                            <button
                                                                type="button"
                                                                className="admin-rhythm__icon-btn admin-rhythm__icon-btn--danger"
                                                                title="Delete row"
                                                                aria-label="Delete row"
                                                                onClick={() => confirmDeleteRow(section.id, row.id)}
                                                            >
                                                                <FaTrash aria-hidden />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        </React.Fragment>
                    );
                })}

                <p className="admin-rhythm__footer-hint">
                    Tip: duplicate this browser profile or export is not built in yet — copy the table into a doc if you
                    need a backup. Clearing site data will remove saved edits.
                </p>
            </div>
        </AdminLayout>
    );
}
