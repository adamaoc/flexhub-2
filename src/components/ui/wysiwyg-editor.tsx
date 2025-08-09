"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Underline,
  List,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Type,
} from "lucide-react";

interface WysiwygEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
}

export function WysiwygEditor({
  value,
  onChange,
  placeholder = "Enter text...",
  className,
  rows = 6,
}: WysiwygEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState({
    bold: false,
    underline: false,
    h1: false,
    h2: false,
    h3: false,
    h4: false,
    list: false,
  });

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || "<p><br></p>";
    }
  }, [value]);

  // Handle focus to ensure proper cursor placement
  const handleFocus = () => {
    if (editorRef.current && !editorRef.current.innerHTML.trim()) {
      editorRef.current.innerHTML = "<p><br></p>";
      // Place cursor at the beginning
      const range = document.createRange();
      const selection = window.getSelection();
      range.setStart(editorRef.current.firstChild!, 0);
      range.collapse(true);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  };

  // Update active states based on cursor position
  const updateActiveStates = () => {
    if (!editorRef.current) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    let element = selection.focusNode;

    // If text node, get parent element
    if (element?.nodeType === Node.TEXT_NODE) {
      element = element.parentElement;
    }

    // Walk up the DOM tree to find formatting elements
    let currentElement = element as Element;
    const formatStates = {
      bold: false,
      underline: false,
      h1: false,
      h2: false,
      h3: false,
      h4: false,
      list: false,
    };

    while (currentElement && currentElement !== editorRef.current) {
      const tagName = currentElement.tagName?.toLowerCase();

      if (tagName === "strong" || tagName === "b") formatStates.bold = true;
      if (tagName === "u") formatStates.underline = true;
      if (tagName === "h1") formatStates.h1 = true;
      if (tagName === "h2") formatStates.h2 = true;
      if (tagName === "h3") formatStates.h3 = true;
      if (tagName === "h4") formatStates.h4 = true;
      if (tagName === "ul" || tagName === "ol" || tagName === "li")
        formatStates.list = true;

      currentElement = currentElement.parentElement as Element;
    }

    setIsActive(formatStates);
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
      updateActiveStates();
    }
  };

  const handleKeyUp = () => {
    updateActiveStates();
  };

  const handleMouseUp = () => {
    updateActiveStates();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle Enter key in lists
    if (e.key === "Enter") {
      const selection = window.getSelection();
      if (selection && selection.focusNode) {
        let element = selection.focusNode;

        // Check if we're in a list item
        while (element && element !== editorRef.current) {
          if (
            element.nodeType === Node.ELEMENT_NODE &&
            (element as Element).tagName === "LI"
          ) {
            const li = element as Element;

            // If the list item is empty, break out of the list
            if (!li.textContent?.trim()) {
              e.preventDefault();

              // Create a new paragraph after the list
              const ul = li.closest("ul, ol");
              if (ul) {
                const p = document.createElement("p");
                p.innerHTML = "<br>";
                ul.parentNode?.insertBefore(p, ul.nextSibling);

                // Remove the empty list item
                li.remove();

                // If the list is now empty, remove it
                if (!ul.children.length) {
                  ul.remove();
                }

                // Place cursor in the new paragraph
                const range = document.createRange();
                range.selectNodeContents(p);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);

                handleInput();
                updateActiveStates();
              }
            }
            break;
          }
          element = element.parentNode as Node;
        }
      }
    }
  };

  const execCommand = (command: string, value?: string) => {
    // Ensure editor is focused before executing command
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    // Force update after command
    setTimeout(() => {
      handleInput();
      updateActiveStates();
    }, 10);
  };

  const formatHeading = (tag: string) => {
    if (!editorRef.current) return;

    const selection = window.getSelection();
    if (!selection) return;

    editorRef.current.focus();

    // Get the current block element containing the cursor
    let currentNode = selection.focusNode;
    let blockElement: Element | null = null;

    // Find the block element
    while (currentNode && currentNode !== editorRef.current) {
      if (currentNode.nodeType === Node.ELEMENT_NODE) {
        const element = currentNode as Element;
        if (
          ["P", "DIV", "H1", "H2", "H3", "H4", "H5", "H6"].includes(
            element.tagName
          )
        ) {
          blockElement = element;
          break;
        }
      }
      currentNode = currentNode.parentNode;
    }

    // If no block element found, create one
    if (!blockElement) {
      // Create a new paragraph and wrap any text content
      const p = document.createElement("p");
      if (selection.focusNode?.textContent) {
        p.textContent = selection.focusNode.textContent;
        selection.focusNode.parentNode?.replaceChild(p, selection.focusNode);
      } else {
        p.innerHTML = "<br>";
        editorRef.current.appendChild(p);
      }
      blockElement = p;
    }

    const currentTag = blockElement.tagName.toLowerCase();
    const targetTag = tag.toLowerCase();

    // If it's the same heading type, convert to paragraph
    if (currentTag === targetTag) {
      const newElement = document.createElement("p");
      newElement.innerHTML = blockElement.innerHTML || "<br>";
      blockElement.parentNode?.replaceChild(newElement, blockElement);

      // Place cursor in the new element
      const range = document.createRange();
      range.selectNodeContents(newElement);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      // Convert to the new heading type
      const newElement = document.createElement(targetTag);
      newElement.innerHTML = blockElement.innerHTML || "<br>";
      blockElement.parentNode?.replaceChild(newElement, blockElement);

      // Place cursor in the new element
      const range = document.createRange();
      range.selectNodeContents(newElement);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }

    // Update the editor content and states
    handleInput();
    updateActiveStates();
  };

  const insertBulletList = () => {
    if (!editorRef.current) return;

    const selection = window.getSelection();
    if (!selection) return;

    editorRef.current.focus();

    // Get all block elements in the selection
    const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    if (!range) return;

    // Find all block elements that intersect with the selection
    const blockElements: Element[] = [];
    let inList = false;

    // If selection is collapsed, just handle the current block
    if (range.collapsed) {
      let currentNode = selection.focusNode;
      let blockElement: Element | null = null;
      let listElement: Element | null = null;

      while (currentNode && currentNode !== editorRef.current) {
        if (currentNode.nodeType === Node.ELEMENT_NODE) {
          const element = currentNode as Element;
          if (element.tagName === "UL" || element.tagName === "OL") {
            listElement = element;
            inList = true;
            break;
          }
          if (
            ["P", "DIV", "H1", "H2", "H3", "H4", "H5", "H6", "LI"].includes(
              element.tagName
            )
          ) {
            blockElement = element;
          }
        }
        currentNode = currentNode.parentNode;
      }

      if (listElement) {
        blockElements.push(listElement);
      } else if (blockElement) {
        blockElements.push(blockElement);
      }
    } else {
      // Handle multi-line selection
      const startContainer = range.startContainer;
      const endContainer = range.endContainer;

      // Find all block elements between start and end
      const walker = document.createTreeWalker(
        editorRef.current,
        NodeFilter.SHOW_ELEMENT,
        {
          acceptNode: (node) => {
            const element = node as Element;
            if (
              [
                "P",
                "DIV",
                "H1",
                "H2",
                "H3",
                "H4",
                "H5",
                "H6",
                "LI",
                "UL",
                "OL",
              ].includes(element.tagName)
            ) {
              return NodeFilter.FILTER_ACCEPT;
            }
            return NodeFilter.FILTER_SKIP;
          },
        }
      );

      let currentNode = walker.nextNode();
      let foundStart = false;

      while (currentNode) {
        const element = currentNode as Element;

        // Check if this element contains or is contained by the selection
        if (!foundStart) {
          if (
            currentNode === startContainer ||
            currentNode.contains(startContainer) ||
            startContainer.contains(currentNode)
          ) {
            foundStart = true;
          }
        }

        if (foundStart) {
          // Check if we're in a list
          if (element.tagName === "UL" || element.tagName === "OL") {
            inList = true;
          }

          if (
            ["P", "DIV", "H1", "H2", "H3", "H4", "H5", "H6", "LI"].includes(
              element.tagName
            )
          ) {
            blockElements.push(element);
          }

          // Stop if we've reached the end
          if (
            currentNode === endContainer ||
            currentNode.contains(endContainer) ||
            endContainer.contains(currentNode)
          ) {
            break;
          }
        }

        currentNode = walker.nextNode();
      }
    }

    if (blockElements.length === 0) return;

    if (inList) {
      // Convert list items back to paragraphs
      const fragment = document.createDocumentFragment();

      blockElements.forEach((element) => {
        if (element.tagName === "LI") {
          const p = document.createElement("p");
          p.innerHTML = element.innerHTML || "<br>";
          fragment.appendChild(p);
        } else if (element.tagName === "UL" || element.tagName === "OL") {
          // Convert entire list
          const listItems = Array.from(element.querySelectorAll("li"));
          listItems.forEach((li) => {
            const p = document.createElement("p");
            p.innerHTML = li.innerHTML || "<br>";
            fragment.appendChild(p);
          });
          element.parentNode?.replaceChild(fragment, element);
          return;
        }
      });

      // Replace list items with paragraphs
      if (fragment.children.length > 0) {
        const firstElement = blockElements[0];

        // Remove elements
        for (let i = blockElements.length - 1; i >= 0; i--) {
          const element = blockElements[i];
          if (element.tagName === "LI") {
            element.remove();
          }
        }

        // Insert new paragraphs
        if (firstElement.parentNode) {
          firstElement.parentNode.insertBefore(fragment, firstElement);
        }
      }
    } else {
      // Convert selected blocks to list items
      const ul = document.createElement("ul");

      blockElements.forEach((element, index) => {
        const li = document.createElement("li");
        li.innerHTML = element.innerHTML || "<br>";
        ul.appendChild(li);

        if (index === 0) {
          // Replace first element with the list
          element.parentNode?.replaceChild(ul, element);
        } else {
          // Remove subsequent elements
          element.remove();
        }
      });

      // Place cursor in the first list item
      if (ul.firstElementChild) {
        const range = document.createRange();
        range.selectNodeContents(ul.firstElementChild);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }

    // Update the editor content and states
    handleInput();
    updateActiveStates();
  };

  const toolbarButtons = [
    {
      icon: Type,
      label: "Normal Text",
      action: () => execCommand("formatBlock", "p"),
      active: !isActive.h1 && !isActive.h2 && !isActive.h3 && !isActive.h4,
    },
    {
      icon: Heading1,
      label: "Heading 1",
      action: () => formatHeading("h1"),
      active: isActive.h1,
    },
    {
      icon: Heading2,
      label: "Heading 2",
      action: () => formatHeading("h2"),
      active: isActive.h2,
    },
    {
      icon: Heading3,
      label: "Heading 3",
      action: () => formatHeading("h3"),
      active: isActive.h3,
    },
    {
      icon: Heading4,
      label: "Heading 4",
      action: () => formatHeading("h4"),
      active: isActive.h4,
    },
    {
      icon: Bold,
      label: "Bold",
      action: () => execCommand("bold"),
      active: isActive.bold,
    },
    {
      icon: Underline,
      label: "Underline",
      action: () => execCommand("underline"),
      active: isActive.underline,
    },
    {
      icon: List,
      label: "Bullet List",
      action: insertBulletList,
      active: isActive.list,
    },
  ];

  // Create a unique ID for this editor instance
  const editorId = `wysiwyg-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`border rounded-md ${className || ""}`}>
      {/* Global styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .${editorId} [contenteditable]:empty:before {
            content: attr(data-placeholder);
            color: #9ca3af;
            pointer-events: none;
            font-style: italic;
          }
          
          .${editorId} [contenteditable] h1 {
            font-size: 32px !important;
            font-weight: 700 !important;
            margin: 0 0 8px 0 !important;
            line-height: 1.3 !important;
            color: #1f2937 !important;
            display: block !important;
          }
          
          .${editorId} [contenteditable] h2 {
            font-size: 24px !important;
            font-weight: 700 !important;
            margin: 16px 0 8px 0 !important;
            line-height: 1.3 !important;
            color: #1f2937 !important;
            display: block !important;
          }
          
          .${editorId} [contenteditable] h3 {
            font-size: 20px !important;
            font-weight: 700 !important;
            margin: 16px 0 8px 0 !important;
            line-height: 1.3 !important;
            color: #1f2937 !important;
            display: block !important;
          }
          
          .${editorId} [contenteditable] h4 {
            font-size: 18px !important;
            font-weight: 700 !important;
            margin: 16px 0 8px 0 !important;
            line-height: 1.3 !important;
            color: #1f2937 !important;
            display: block !important;
          }
          
          .${editorId} [contenteditable] p {
            margin: 8px 0 !important;
            line-height: 1.6 !important;
            color: #374151 !important;
            font-size: 14px !important;
            display: block !important;
          }
          
          .${editorId} [contenteditable] ul {
            margin: 12px 0 !important;
            padding-left: 32px !important;
            list-style-type: disc !important;
            list-style-position: outside !important;
            display: block !important;
          }
          
          .${editorId} [contenteditable] ol {
            margin: 12px 0 !important;
            padding-left: 32px !important;
            list-style-type: decimal !important;
            list-style-position: outside !important;
            display: block !important;
          }
          
          .${editorId} [contenteditable] li {
            margin: 6px 0 !important;
            line-height: 1.6 !important;
            color: #374151 !important;
            font-size: 14px !important;
            display: list-item !important;
            list-style: inherit !important;
          }
          
          .${editorId} [contenteditable] strong,
          .${editorId} [contenteditable] b {
            font-weight: 700 !important;
          }
          
          .${editorId} [contenteditable] u {
            text-decoration: underline !important;
          }
        `,
        }}
      />

      {/* Toolbar */}
      <div className="border-b p-2 flex gap-1 flex-wrap">
        {toolbarButtons.map((button, index) => (
          <Button
            key={index}
            type="button"
            variant={button.active ? "default" : "ghost"}
            size="sm"
            onClick={button.action}
            className="h-8 w-8 p-0"
            title={button.label}
          >
            <button.icon className="h-4 w-4" />
          </Button>
        ))}
      </div>

      {/* Editor */}
      <div className={editorId}>
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onKeyUp={handleKeyUp}
          onKeyDown={handleKeyDown}
          onMouseUp={handleMouseUp}
          onFocus={handleFocus}
          className="p-3 min-h-[120px] outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          style={{
            minHeight: `${rows * 1.5}rem`,
          }}
          suppressContentEditableWarning={true}
          data-placeholder={placeholder}
        />
      </div>
    </div>
  );
}
