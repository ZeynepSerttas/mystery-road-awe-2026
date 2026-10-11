function TimelinePage() {
  // Link to the same view in the vanilla app, which still has the working version
  const vanillaUrl = import.meta.env.BASE_URL + "#timeline";

  return (
    <section className="view active">
      <h2>Investigation Timeline</h2>
      <p className="hint-text">This view has not been migrated to React yet.</p>
      <p>
        <a href={vanillaUrl}>Open it in the vanilla app</a>
      </p>
    </section>
  );
}

export default TimelinePage;
