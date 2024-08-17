import "../../styles/style.css";
import {
  getNotes,
  addNote,
  getArchivedNotes,
  archiveNote,
  unarchiveNote,
  deleteNote,
  showLoading,
  hideLoading,
  screenLoading,
} from "./utils.js";

class NoteHeader extends HTMLElement {
  connectedCallback() {
    screenLoading();
    this.innerHTML = `
            <header class="mb-4 text-center">
                <h1 class="display-4">Simple Notes App</h1>
            </header>
        `;
  }
}

class NoteForm extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
            <form class="mb-4">
                <h2 class="mb-3">Add New Note</h2>
                <div class="mb-3">
                    <input type="text" class="form-control" id="title" placeholder="Title" required>
                </div>
                <div class="mb-3">
                    <textarea class="form-control" id="body" placeholder="Note content" rows="3" required></textarea>
                </div>
                <button type="submit" class="btn btn-primary">Add Note</button>
            </form>
        `;

    this.querySelector("form").addEventListener(
      "submit",
      this.handleSubmit.bind(this),
    );
  }

  async handleSubmit(event) {
    event.preventDefault();
    const title = this.querySelector("#title").value;
    const body = this.querySelector("#body").value;

    if (title && body) {
      showLoading();
      try {
        await addNote(title, body);
        this.querySelector("#title").value = "";
        this.querySelector("#body").value = "";
        const noteList = document.querySelector("note-list");
        if (noteList) {
          await noteList.renderNotes();
        }
        alert("Note added successfully!");
      } catch (error) {
        alert("Failed to add note: " + error.message);
      } finally {
        hideLoading();
      }
    } else {
      alert("Please fill in both title and body!");
    }
  }
}

class NoteList extends HTMLElement {
  constructor() {
    super();
    this.showArchived = false;
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = `
            <div>
                <button id="toggle-archived" class="btn btn-secondary mb-3">
                    ${this.showArchived ? "Show Active Notes" : "Show Archived Notes"}
                </button>
                <div id="notes-container"></div>
            </div>
        `;
    this.querySelector("#toggle-archived").addEventListener("click", () => {
      this.showArchived = !this.showArchived;
      this.renderNotes();
    });
    this.renderNotes();
  }

  async renderNotes() {
    const container = this.querySelector("#notes-container");
    container.innerHTML = "";
    showLoading();
    try {
      const notes = this.showArchived
        ? await getArchivedNotes()
        : await getNotes();
      notes.forEach((note) => {
        const noteElement = document.createElement("note-item");
        noteElement.setAttribute("id", note.id);
        noteElement.setAttribute("title", note.title);
        noteElement.setAttribute("body", note.body);
        noteElement.setAttribute("createdAt", note.createdAt);
        noteElement.setAttribute("archived", this.showArchived.toString());
        container.appendChild(noteElement);
      });
    } catch (error) {
      console.error("Error getting notes:", error);
      alert("Failed to fetch notes: " + error.message);
    } finally {
      hideLoading();
    }
    this.querySelector("#toggle-archived").textContent = this.showArchived
      ? "Show Active Notes"
      : "Show Archived Notes";
  }
}

class NoteItem extends HTMLElement {
  connectedCallback() {
    const id = this.getAttribute("id");
    const title = this.getAttribute("title");
    const body = this.getAttribute("body");
    const createdAt = new Date(this.getAttribute("createdAt")).toLocaleString();
    const isArchived = this.getAttribute("archived") === "true";

    this.innerHTML = `
            <div class="card mb-3">
                <div class="card-body">
                    <h5 class="card-title">${title}</h5>
                    <p class="card-text">${body}</p>
                    <p class="card-text"><small class="text-muted">Created: ${createdAt}</small></p>
                    <button class="btn btn-danger btn-sm delete-note" data-id="${id}">Delete</button>
                    <button class="btn btn-primary btn-sm archive-note" data-id="${id}">
                        ${isArchived ? "Unarchive" : "Archive"}
                    </button>
                </div>
            </div>
        `;

    this.querySelector(".delete-note").addEventListener(
      "click",
      this.handleDelete.bind(this),
    );
    this.querySelector(".archive-note").addEventListener(
      "click",
      this.handleArchive.bind(this),
    );
  }

  async handleDelete(event) {
    const id = event.target.getAttribute("data-id");
    showLoading();
    try {
      await deleteNote(id);
      this.remove();
      alert("Note deleted successfully!");
    } catch (error) {
      alert("Failed to delete note: " + error.message);
    } finally {
      hideLoading();
    }
  }

  async handleArchive(event) {
    const id = event.target.getAttribute("data-id");
    const isArchived = this.getAttribute("archived") === "true";
    showLoading();
    try {
      if (isArchived) {
        await unarchiveNote(id);
        alert("Note unarchived successfully!");
      } else {
        await archiveNote(id);
        alert("Note archived successfully!");
      }
      const noteList = this.closest("note-list");
      if (noteList) {
        await noteList.renderNotes();
      }
    } catch (error) {
      alert("Failed to archive/unarchive note: " + error.message);
    } finally {
      hideLoading();
    }
  }
}

class LoadingIndicator extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        `;
  }
}

customElements.define("note-header", NoteHeader);
customElements.define("note-form", NoteForm);
customElements.define("note-list", NoteList);
customElements.define("note-item", NoteItem);
customElements.define("loading-indicator", LoadingIndicator);

document.addEventListener("DOMContentLoaded", async () => {
  const noteList = document.querySelector("note-list");
  if (noteList) {
    await noteList.renderNotes();
  }

  document.body.addEventListener("click", async (event) => {
    if (event.target.closest("article")) {
      const article = event.target.closest("article");
      const id = article.getAttribute("data-userid");

      if (event.target.classList.contains("delete-note")) {
        showLoading();
        try {
          await deleteNote(id);
          article.remove();
          alert("Note deleted successfully!");
        } catch (error) {
          console.error("Error deleting note:", error);
          alert("Failed to delete note: " + error.message);
        } finally {
          hideLoading();
        }
      } else if (event.target.classList.contains("archive-note")) {
        showLoading();
        try {
          if (noteList.showArchived) {
            await unarchiveNote(id);
            alert("Note unarchived successfully!");
          } else {
            await archiveNote(id);
            alert("Note archived successfully!");
          }
          await noteList.renderNotes();
        } catch (error) {
          console.error("Error archiving/unarchiving note:", error);
          alert("Failed to archive/unarchive note: " + error.message);
        } finally {
          hideLoading();
        }
      }
    }
  });
});
