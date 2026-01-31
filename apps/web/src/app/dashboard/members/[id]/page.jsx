export default function Page({ params }) {
  const { id } = params;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Member ID: {id}</h1>
    </div>
  );
}
