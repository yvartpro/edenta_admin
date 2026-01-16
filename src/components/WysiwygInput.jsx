import { useRef, useEffect } from "react";


export default function WysiwygInput({ value, onChange, placeholder = "Type your text here..." }) {
    const textareaRef = useRef(null);

    // Auto-resize
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
        }
    }, [value]);

    return (
        <textarea
            ref={textareaRef}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-transparent border-0 focus:ring-0 p-0 text-gray-700 resize-none min-h-[60px]"
        />
    );
}
