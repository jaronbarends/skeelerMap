export default async function ErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  // eslint-disable-next-line no-console
  console.log('params:', params);

  return (
    <div>
      <h1>Er ging iets mis.</h1>
    </div>
  );
}
