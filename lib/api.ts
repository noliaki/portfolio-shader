export async function fetchGraphQL(query: string): Promise<any> {
  return await fetch(
    `https://graphql.contentful.com/content/v1/spaces/${
      process.env.CTF_SPACE_ID ?? ''
    }`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.CTF_ACCESS_TOKEN ?? ''}`,
      },
      body: JSON.stringify({ query }),
    }
  ).then(async (res: Response): Promise<any> => await res.json())
}
