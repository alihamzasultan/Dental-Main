import React, { useRef, useEffect, useState, useMemo } from 'react';

interface TokenEditorProps {
    value: string;
    onChange: (newValue: string) => void;
    placeholder?: string;
    className?: string;
}

const VARIABLE_MAPPING = [
    { pattern: /\{\{\s*\$json\['Customer Name'\]\s*\}\}/g, label: 'Customer Name' },
    { pattern: /\{\{\s*\$\('Get row\(s\) in sheet'\)\.item\.json\['Customer Name'\]\s*\}\}/g, label: 'Customer Name' },
    { pattern: /\{\{\s*\$\('Code in JavaScript'\)\.item\.json\.customer_name.*\}\}/g, label: 'Customer Name' },
    { pattern: /\{\{\s*\$\('Get row\(s\) in sheet1'\)\.first\(\)\.json\['Customer Name'\]\s*\}\}/g, label: 'Customer Name' },
    { pattern: /\{\{\s*\$\('Get row\(s\) in sheet'\)\.first\(\)\.json\['Customer Name'\]\s*\}\}/g, label: 'Customer Name' },
    { pattern: /\{\{\s*DateTime\.fromISO\(\$\('Update an event'\)\.item\.json\.start\.dateTime\)\.toFormat\("MMM d, yyyy 'at' h:mm a"\)\s*\}\}/g, label: 'Appointment Time' },
    { pattern: /\{\{\s*DateTime\.fromISO\(\$\('Create an event'\)\.item\.json\.start\.dateTime\)\.toFormat\("MMM d, yyyy 'at' h:mm a"\)\s*\}\}/g, label: 'Appointment Time' },
    { pattern: /\{\{\s*DateTime\.fromISO\(\$json\['Booking Date'\]\)\.toFormat\('MMM d, yyyy'\)\s*\}\}/g, label: 'Booking Date' },
    { pattern: /\{\{\s*DateTime\.fromISO\(\$json\['Booking Date'\]\)\.toFormat\('h:mm a'\)\s*\}\}/g, label: 'Booking Time' },
    { pattern: /\{\{\s*DateTime\.fromISO\(\$\('Get row\(s\) in sheet1'\)\.first\(\)\.json\['Booking Date'\]\)\.toFormat\('MMM d'\)\s*\}\}/g, label: 'Booking Date' },
    { pattern: /\{\{\s*DateTime\.fromISO\(\$\('Get row\(s\) in sheet1'\)\.first\(\)\.json\['Booking Date'\]\)\.toFormat\('h:mm a'\)\s*\}\}/g, label: 'Booking Time' },
    { pattern: /\{\{\s*\$\('Get row\(s\) in sheet'\)\.first\(\)\.json\['Reason for visit'\]\s*\}\}/g, label: 'Reason for Visit' },
    // Catch-all for other expressions
    { pattern: /\{\{.*?\}\}/g, label: 'Variable' }
];

export function TokenEditor({ value, onChange, placeholder, className }: TokenEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState(false);

    // Convert raw text to HTML with tokens
    const textToHtml = (text: string) => {
        let html = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        
        // Split text by variables and find matches
        const tokens: { text: string; isVar: boolean; label?: string; raw?: string }[] = [];
        let lastIndex = 0;
        
        // Combine all regex into one for easier splitting while preserving order
        const masterRegex = /\{\{.*?\}\}/g;
        let match;
        
        while ((match = masterRegex.exec(text)) !== null) {
            // Push preceding text
            if (match.index > lastIndex) {
                tokens.push({ text: text.substring(lastIndex, match.index), isVar: false });
            }
            
            // Find specific label for this variable
            const rawVar = match[0];
            const mapper = VARIABLE_MAPPING.find(m => rawVar.match(m.pattern));
            tokens.push({ 
                text: mapper ? `[${mapper.label}]` : '[Variable]', 
                isVar: true, 
                label: mapper ? mapper.label : 'Variable',
                raw: rawVar 
            });
            
            lastIndex = masterRegex.lastIndex;
        }
        
        // Push remaining text
        if (lastIndex < text.length) {
            tokens.push({ text: text.substring(lastIndex), isVar: false });
        }

        return tokens.map(t => {
            if (t.isVar) {
                return `<span class="token-badge" contenteditable="false" data-raw="${t.raw?.replace(/"/g, '&quot;')}" title="${t.raw?.replace(/"/g, '&quot;')}">${t.text}</span>`;
            }
            return t.text;
        }).join('');
    };

    // Convert HTML back to raw text
    const htmlToText = (node: HTMLDivElement) => {
        let text = '';
        const children = Array.from(node.childNodes);
        
        children.forEach(child => {
            if (child.nodeType === Node.TEXT_NODE) {
                text += child.textContent;
            } else if (child.nodeType === Node.ELEMENT_NODE) {
                const el = child as HTMLElement;
                if (el.classList.contains('token-badge')) {
                    text += el.getAttribute('data-raw') || '';
                } else {
                    text += htmlToText(el as HTMLDivElement);
                }
            }
        });
        return text;
    };

    useEffect(() => {
        if (editorRef.current && editorRef.current.getAttribute('data-last-sync') !== value) {
            editorRef.current.innerHTML = textToHtml(value);
            editorRef.current.setAttribute('data-last-sync', value);
        }
    }, [value]);

    const handleInput = () => {
        if (editorRef.current) {
            const newValue = htmlToText(editorRef.current);
            editorRef.current.setAttribute('data-last-sync', newValue);
            onChange(newValue);
        }
    };

    return (
        <div className="token-editor-container">
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className={`token-editor ${className} ${isFocused ? 'focused' : ''}`}
                style={{
                    minHeight: '200px',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--input)',
                    color: 'var(--foreground)',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    outline: 'none',
                    overflowY: 'auto',
                    cursor: 'text',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                }}
                data-placeholder={placeholder}
            />
            <style>{`
                .token-editor:empty:before {
                    content: attr(data-placeholder);
                    color: var(--muted);
                    pointer-events: none;
                }
                .token-badge {
                    display: inline-flex;
                    align-items: center;
                    background-color: var(--primary-light);
                    color: var(--primary);
                    padding: 2px 8px;
                    border-radius: 6px;
                    font-size: 13px;
                    font-weight: 700;
                    margin: 0 4px;
                    border: 1px solid var(--primary);
                    user-select: none;
                    cursor: default;
                }
                .token-badge:hover {
                    box-shadow: 0 0 0 2px var(--primary);
                }
                .token-editor.focused {
                    border-color: var(--primary);
                    box-shadow: 0 0 0 2px var(--primary-light);
                }
            `}</style>
        </div>
    );
}
