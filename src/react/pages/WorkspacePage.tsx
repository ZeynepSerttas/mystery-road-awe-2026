function WorkspacePage() {
  // Link to the same view in the vanilla app, which still has the working version
  const vanillaUrl = import.meta.env.BASE_URL + "#workspace";

  return (
    <section className="view active">
      <h2>Investigator Workspace</h2>
      <p className="hint-text">This view has not been migrated to React yet.</p>
      <p>
        <a href={vanillaUrl}>Open it in the vanilla app</a>
      </p>
    </section>
  );
}

export default WorkspacePage;
