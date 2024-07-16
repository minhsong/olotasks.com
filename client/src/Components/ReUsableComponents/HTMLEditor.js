import React, { useEffect, useRef } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

const editorConfiguration = {
  //   plugins: [Essentials, Bold, Italic, Paragraph],
  toolbar: [
    "Bold",
    "Italic",
    "Underline",
    "TextColor",
    "BGColor",
    "Link",
    "bulletedList",
    "numberedList",
    "blockQuote",
    "undo",
    "redo",
  ],
};

const HTMLEditor = ({ value, onChange, ...props }) => {
  useEffect(() => {}, [value]);

  return (
    <div style={{ width: "100%" }}>
      <CKEditor
        ref={props.ref}
        {...props}
        editor={ClassicEditor}
        config={{ ...editorConfiguration, placeholder: props.placeholder }}
        data={value}
        placeholder={props.placeholder} // Add placeholder from props
        onReady={(editor) => {
          // You can store the "editor" and use when it is needed.
        }}
        onChange={(event, editor) => {
          const data = editor.getData();
          onChange(data);
        }}
      />
    </div>
  );
};

export default HTMLEditor;
