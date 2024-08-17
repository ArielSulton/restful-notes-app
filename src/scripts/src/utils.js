const DICODING_NOTES_API = "https://notes-api.dicoding.dev/v2";

export async function getNotes() {
  const response = await fetch(`${DICODING_NOTES_API}/notes`);
  if (!response.ok) {
    throw new Error("Failed to fetch notes");
  }
  const data = await response.json();
  return data.data;
}

export async function addNote(title, body) {
  const response = await fetch(`${DICODING_NOTES_API}/notes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title, body }),
  });
  if (!response.ok) {
    throw new Error("Failed to add note");
  }
  return await response.json();
}

export async function getArchivedNotes() {
  const response = await fetch(`${DICODING_NOTES_API}/notes/archived`);
  if (!response.ok) {
    throw new Error("Failed to fetch archived notes");
  }
  const data = await response.json();
  return data.data;
}

export async function archiveNote(id) {
  const response = await fetch(`${DICODING_NOTES_API}/notes/${id}/archive`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error("Failed to archive note");
  }
  return await response.json();
}

export async function unarchiveNote(id) {
  const response = await fetch(`${DICODING_NOTES_API}/notes/${id}/unarchive`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error("Failed to unarchive note");
  }
  return await response.json();
}

export async function deleteNote(id) {
  const response = await fetch(`${DICODING_NOTES_API}/notes/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete note");
  }
  return await response.json();
}

export function showLoading() {
  document.querySelector("loading-indicator").style.display = "block";
}

export function hideLoading() {
  document.querySelector("loading-indicator").style.display = "none";
}

export function screenLoading() {
  window.addEventListener("load", () => {
    const loading = document.querySelector(".loading");

    setTimeout(() => {
      loading.style.display = "none";
    }, 1600);
  });
}
