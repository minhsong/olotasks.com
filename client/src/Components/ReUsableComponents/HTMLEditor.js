import React, { useEffect, useRef } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
// import { Mention } from "@ckeditor/ckeditor5-mention";

const editorConfiguration = {
  //   plugins: [Essentials, Bold, Italic, Paragraph],
  // plugins: [Mention],

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

const items = [
  {
    id: "@swarley",
    userId: "1",
    name: "Barney Stinson",
    link: "https://www.imdb.com/title/tt0460649/characters/nm0000439",
  },
  {
    id: "@lilypad",
    userId: "2",
    name: "Lily Aldrin",
    link: "https://www.imdb.com/title/tt0460649/characters/nm0004989",
  },
  {
    id: "@marry",
    userId: "3",
    name: "Marry Ann Lewis",
    link: "https://www.imdb.com/title/tt0460649/characters/nm1130627",
  },
  {
    id: "@marshmallow",
    userId: "4",
    name: "Marshall Eriksen",
    link: "https://www.imdb.com/title/tt0460649/characters/nm0781981",
  },
  {
    id: "@rsparkles",
    userId: "5",
    name: "Robin Scherbatsky",
    link: "https://www.imdb.com/title/tt0460649/characters/nm1130627",
  },
  {
    id: "@tdog",
    userId: "6",
    name: "Ted Mosby",
    link: "https://www.imdb.com/title/tt0460649/characters/nm1102140",
  },
];

function getFeedItems(queryText) {
  // As an example of an asynchronous action, return a promise
  // that resolves after a 100ms timeout.
  // This can be a server request or any sort of delayed action.
  return new Promise((resolve) => {
    setTimeout(() => {
      const itemsToDisplay = items
        // Filter out the full list of all items to only those matching the query text.
        .filter(isItemMatching)
        // Return 10 items max - needed for generic queries when the list may contain hundreds of elements.
        .slice(0, 10);

      resolve(itemsToDisplay);
    }, 100);
  });

  // Filtering function - it uses the `name` and `username` properties of an item to find a match.
  function isItemMatching(item) {
    // Make the search case-insensitive.
    const searchString = queryText.toLowerCase();

    // Include an item in the search results if the name or username includes the current user input.
    return (
      item.name.toLowerCase().includes(searchString) ||
      item.id.toLowerCase().includes(searchString)
    );
  }
}

const HTMLEditor = ({ value, onChange, ...props }) => {
  useEffect(() => {}, [value]);

  return (
    <div style={{ width: "100%" }}>
      <CKEditor
        ref={props.ref}
        {...props}
        editor={ClassicEditor}
        config={{
          ...editorConfiguration,
          placeholder: props.placeholder,
          mention: {
            feeds: [
              {
                marker: "@",
                feed: getFeedItems,
              },
            ],
          },
        }}
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
