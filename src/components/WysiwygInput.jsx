import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

/**
 * Toolbar configuration including color and lists as requested.
 */
const modules = {
    toolbar: [
        ['bold', 'italic', 'underline'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ color: [] }],
        ['clean'],
    ],
};

const formats = [
    'bold',
    'italic',
    'underline',
    'list',
    'color'
];

const WysiwygInput = ({ value, onChange, placeholder }) => {
    return (
        <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
            <ReactQuill
                theme="snow"
                value={value || ''}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder || "Start writing..."}
            />
        </div>
    );
};

export default WysiwygInput;
