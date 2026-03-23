import { ShelbyClient } from "@shelby-protocol/sdk";

const client = new ShelbyClient({});

export async function uploadScore(score) {
  const data = JSON.stringify({
    player: "Tung",
    score: score,
    time: new Date().toISOString(),
  });

  const file = new Blob([data], {
    type: "application/json",
  });

  const res = await client.uploadFile(file);

  return res;
}