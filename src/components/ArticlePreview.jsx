// import { clsx } from "clsx";

export default function ArticlePreview({ data }) {
  if (!data) return <div className="text-gray-400">No data to preview</div>;

  const sections = data.content?.sections || [];

  return (
    <div className="max-w-xl mx-auto font-sans">
      {/* HEADER */}
      <div className="mb-8">
        <span className="text-indigo-600 font-bold uppercase text-xs tracking-wider">
          {data.category?.name || "Uncategorized"}
        </span>
        <h1 className="text-3xl font-extrabold text-gray-900 leading-tight mt-2 mb-3">
          {data.title || "Untitled Article"}
        </h1>
        {data.subtitle && (
          <h2 className="text-xl text-gray-500 font-medium leading-snug mb-4">
            {data.subtitle}
          </h2>
        )}

        {data.hero_url && (
          <div className="w-full aspect-video rounded-xl overflow-hidden mb-6 shadow-md">
            <img src={data.hero_url} alt="Hero" className="w-full h-full object-cover" />
          </div>
        )}

        {data.summary && (
          <div className="text-lg text-gray-700 font-serif leading-relaxed italic border-l-4 border-gray-200 pl-4">
            {data.summary}
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="space-y-12">
        {sections.map((section) => (
          <section key={section.id}>
            {section.title && (
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{section.title}</h3>
            )}

            <div className="space-y-6">
              {(section.blocks || []).map((block) => {
                switch (block.type) {
                  case "text":
                    return <p key={block.id} className="text-gray-800 leading-7 whitespace-pre-wrap">{block.value}</p>;
                  case "image": {
                    let src = block.value;
                    if (!src && block.fileId && data.contentFiles) {
                      const file = data.contentFiles.find(f => f.id === block.fileId);
                      if (file) src = file.url;
                    }
                    return (
                      <figure key={block.id} className="my-6">
                        {src ? (
                          <img src={src} alt="" className="w-full rounded-lg shadow-sm" />
                        ) : (
                          <div className="text-red-500 text-sm bg-red-50 p-2 rounded">Image not found (ID: {block.fileId})</div>
                        )}
                      </figure>
                    );
                  }
                  case "video":
                    return (
                      <div key={block.id} className="my-6 aspect-video bg-black rounded-lg flex items-center justify-center text-white">
                        VIDEO PLACEHOLDER
                      </div>
                    );
                  case "list":
                    return (
                      <div key={block.id} className="bg-gray-100 p-4 rounded text-xs text-gray-500">List Preview Not Implemented</div>
                    );
                  default:
                    return null;
                }
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
