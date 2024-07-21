import React, { useEffect, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css"; // Add css for snow theme
import { Mention, MentionBlot } from "quill-mention"; // Import quill-mention
import "quill-mention/dist/quill.mention.css"; // Import quill-mention default styles
import { Container } from "./styled";

export default ({
  onChanged,
  onBlur,
  value,
  onFocus,
  onMention,
  placeholder,
  users = [],
}) => {
  const quillRef = React.useRef(null);
  const [quill, setQuill] = useState(null);

  // Ensure the Quill editor is configured correctly
  useEffect(() => {
    if (quillRef.current && !quill) {
      Quill.register({
        "blots/mention": MentionBlot,
        "modules/mention": Mention,
      });
      const quillInstance = new Quill(quillRef.current, {
        theme: "snow",
        placeholder: placeholder,
        modules: {
          toolbar: [
            ["bold", "italic", "underline", "strike", "blockquote"],
            [
              { list: "ordered" },
              { list: "bullet" },
              { indent: "-1" },
              { indent: "+1" },
            ],
            ["link"],
          ],
          mention: {
            allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
            mentionDenotationChars: ["@"],
            source: function (searchTerm, renderList, mentionChar) {
              if (mentionChar === "@") {
                if (searchTerm.length === 0) {
                  renderList(users, searchTerm);
                } else {
                  const matches = [];
                  for (let i = 0; i < users.length; i++)
                    if (
                      ~users[i].value
                        .toLowerCase()
                        .indexOf(searchTerm.toLowerCase())
                    )
                      matches.push(users[i]);
                  renderList(matches, searchTerm);
                }
              }
            },
          },
        },
      });
      quillInstance.root.innerHTML = value;
      quillInstance.on("text-change", () => {
        onChanged && onChanged(quillInstance.root.innerHTML);
        const delta = quillInstance.getContents();
        const mentionsArray = [];

        delta.ops.forEach((op) => {
          if (op.insert && op.insert.mention) {
            mentionsArray.push(op.insert.mention);
          }
        });

        onMention &&
          onMention(
            mentionsArray.map((mention) => ({
              id: mention.id,
              value: mention.value,
            }))
          );
      });
      quillInstance.on("selection-change", () => {
        onBlur && onBlur(quillInstance.root.innerHTML);
      });

      quillInstance.on("focus", () => {
        onFocus && onFocus(quillInstance.root.innerHTML);
      });

      setQuill(quillInstance);
    }
  }, [quillRef, quill]);

  useEffect(() => {
    if (quill && value !== quill.root.innerHTML) {
      quill.root.innerHTML = value;
    }
  }, [value]);

  return (
    <Container>
      <div ref={quillRef} />
    </Container>
  );
};
