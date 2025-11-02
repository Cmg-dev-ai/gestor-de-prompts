// Chave para identicar os dados salvos  pela aplicação no navegador
const STORAGE_KEY = "prompts_storage"

// Estado para guardar os prompts salvos e exibir
const state = {
  prompts: [],
  selectedId: null,
}

// Seleção dos elementos por id
const elements = {
  promptTitle: document.getElementById("prompt-title"),
  promptContent: document.getElementById("prompt-content"),
  titleWrapper: document.getElementById("title-wrapper"),
  contentWrapper: document.getElementById("content-wrapper"),
  btnOpen: document.getElementById("btn-open"),
  btnCollapse: document.getElementById("btn-collapse"),
  list: document.getElementById("prompt-list"),

  sidebar: document.querySelector(".sidebar"),
  btnSave: document.getElementById("btn-save"),

  search: document.getElementById("search-input"),
  btnNew: document.getElementById("btn-new"),
  btnCopy: document.getElementById("btn-copy"),
}

function updateEditableWrapperState(element, wrapper) {
  const hasText = element.textContent.trim().length > 0
  wrapper.classList.toggle("is-empty", !hasText)
}

function openSidebar() {
  elements.sidebar.classList.add("open")
  elements.sidebar.classList.remove("collapsed")
}

function closeSidebar() {
  elements.sidebar.classList.remove("open")
  elements.sidebar.classList.add("collapsed")
}

function updateAllEditableStates() {
  updateEditableWrapperState(elements.promptTitle, elements.titleWrapper)
  updateEditableWrapperState(elements.promptContent, elements.contentWrapper)
}

function attachAllEditableHandlers() {
  elements.promptTitle.addEventListener("input", () => {
    updateEditableWrapperState(elements.promptTitle, elements.titleWrapper)
  })

  elements.promptContent.addEventListener("input", () => {
    updateEditableWrapperState(elements.promptContent, elements.contentWrapper)
  })
}

function save() {
  const title = elements.promptTitle.textContent.trim()
  const content = elements.promptContent.innerHTML.trim()
  const hasContent = elements.promptContent.textContent.trim()

  if (!title || !hasContent) {
    alert(
      "Por favor, preencha o título e o conteúdo do prompt antes de salvar."
    )
    return
  }

  if (state.selectedId) {
    // Editar prompt existente
    const existingPrompt = state.prompts.find((p) => p.id === state.selectedId)

    if (existingPrompt) {
      existingPrompt.title = title || "Sem título"
      existingPrompt.content = content || "Sem conteúdo"
    }
  } else {
    const newPrompt = {
      id: Date.now().toString(36),
      title,
      content,
    }
    state.prompts.unshift(newPrompt)
    state.selectedId = newPrompt.id
  }
  renderList(elements.search.value)
  persist()
  alert("Prompt salvo com sucesso!")
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.prompts))
  } catch (error) {
    console.log("Erro ao salvar os prompts no armazenamento local:", error)
  }
}

function load() {
  try {
    const storage = localStorage.getItem(STORAGE_KEY)
    state.prompts = storage ? JSON.parse(storage) : []
    state.selectedId = null
  } catch (error) {
    console.log("Erro ao carregar os prompts do localstorage:", error)
  }
}

function createPromptItem(prompt) {
  return `
  <li class="prompt-item" data-id="${prompt.id}" data-action="select">
    <div class="prompt-item-content">
      <span class="prompt-item-title">${prompt.title}</span>
      <span class="prompt-item-description">${prompt.content}</span>
    </div>

    <button class="btn-icon" title="Remover" data-action="remove">
      <img src="assets/remove.svg" alt="Editar" class="icon icon-trash" />
    </button>
  </li>
  `
}

function renderList(filterText = "") {
  const filteredPrompts = state.prompts
    .filter((prompt) =>
      prompt.title.toLowerCase().includes(filterText.toLowerCase().trim())
    )
    .map((p) => createPromptItem(p))
    .join("")

  elements.list.innerHTML = filteredPrompts
}

function newPrompt() {
  state.selectedId = null
  elements.promptTitle.textContent = ""
  elements.promptContent.innerHTML = ""
  updateAllEditableStates()
  elements.promptTitle.focus()
}

function copySelected() {
  try {
    const content = elements.promptContent
    navigator.clipboard.writeText(content.innerTEXT)

    alert("Conteúdo copiado para a área de transferência!")
  } catch (error) {
    console.log("Erro ao copiar para a área de transferência:", error)
  }
}

// Eventos dos botões
elements.btnSave.addEventListener("click", save)
elements.btnNew.addEventListener("click", newPrompt)
elements.btnCopy.addEventListener("click", copySelected)

elements.search.addEventListener("input", function (event) {
  renderList(event.target.value)
})

elements.list.addEventListener("click", function (event) {
  const removeBtn = event.target.closest("[data-action='remove']")
  const item = event.target.closest("[data-id]")

  if (!item) return

  const id = item.getAttribute("data-id")
  state.selectedId = id

  if (removeBtn) {
    //Remover prompt
    state.prompts = state.prompts.filter((p) => p.id !== id)
    renderList(elements.search.value)
    persist()
    return
  }

  if (event.target.closest("[data-action='select']")) {
    const prompt = state.prompts.find((p) => p.id === id)

    if (prompt) {
      elements.promptTitle.textContent = prompt.title
      elements.promptContent.innerHTML = prompt.content
      state.selectedId = prompt.id
      updateAllEditableStates()
    }
  }
})

// Inicialização da aplicação
function init() {
  load()
  renderList("")
  attachAllEditableHandlers()
  updateAllEditableStates()

  elements.sidebar.classList.remove("open")
  elements.sidebar.classList.remove("collapsed")

  elements.btnOpen.addEventListener("click", openSidebar)
  elements.btnCollapse.addEventListener("click", closeSidebar)
}

init()
