import SavedLocationCard from "../components/SavedLocationCard";

function SavedLocationsPage({ items, onDelete, t, language, userPreferences }) {
  return (
    <section className="section">
      <h1 className="page-heading">{t.savedTitle}</h1>
      <p className="page-subtext">{t.savedText}</p>

      {items.length ? (
        <div className="grid">
          {items.map((item) => (
            <SavedLocationCard
              key={item._id}
              item={item}
              onDelete={onDelete}
              t={t}
              language={language}
              units={userPreferences?.units}
            />
          ))}
        </div>
      ) : (
        <p className="empty-state">{t.emptySaved}</p>
      )}
    </section>
  );
}

export default SavedLocationsPage;
