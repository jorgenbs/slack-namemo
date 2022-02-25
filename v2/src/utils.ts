import fetch from "node-fetch";

export async function searchGiphy(query: string): Promise<string> {
  const response = await fetch(
    `https://api.giphy.com/v1/gifs/search?api_key=${process.env.GIPHY_API_KEY}&q=${query}`
  );
  const responseJson = await response.json();
  return responseJson.data[Math.round(Math.random() * responseJson.data.length)]
    .images.original.url;
}
