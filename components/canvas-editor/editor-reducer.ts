import { v4 as uuidv4 } from "uuid"
import { type CanvasState, ActionType, type EditorAction } from "./editor-types"

// Create a deep copy of the state to avoid mutations
const cloneState = (state: CanvasState): CanvasState => {
  return {
    ...state,
    elements: state.elements.map((element) => ({ ...element })),
    selectedElementIds: [...state.selectedElementIds],
    history: {
      past: state.history.past.map((pastState) => ({
        ...pastState,
        elements: pastState.elements.map((element) => ({ ...element })),
        selectedElementIds: [...pastState.selectedElementIds],
      })),
      future: state.history.future.map((futureState) => ({
        ...futureState,
        elements: futureState.elements.map((element) => ({ ...element })),
        selectedElementIds: [...futureState.selectedElementIds],
      })),
    },
  }
}

// Save current state to history before making changes
const saveHistory = (state: CanvasState): CanvasState => {
  const newState = cloneState(state)

  // Remove history from the state we're saving to avoid deep nesting
  const stateToSave = {
    ...state,
    history: { past: [], future: [] },
  }

  newState.history = {
    past: [...state.history.past, stateToSave],
    future: [], // Clear future when a new action is performed
  }

  return newState
}

// Initial state for the canvas
export const initialCanvasState: CanvasState = {
  width: 1080,
  height: 1080,
  elements: [],
  selectedElementIds: [],
  zoom: 1,
  panOffset: { x: 0, y: 0 },
  history: {
    past: [],
    future: [],
  },
}

// Reducer function to handle all editor actions
export const canvasReducer = (state: CanvasState, action: EditorAction): CanvasState => {
  switch (action.type) {
    case ActionType.AddElement: {
      const newState = saveHistory(state)
      const newElement = {
        ...action.element,
        id: action.element.id || uuidv4(),
        zIndex: Math.max(0, ...state.elements.map((el) => el.zIndex)) + 1,
      }

      return {
        ...newState,
        elements: [...newState.elements, newElement],
        selectedElementIds: [newElement.id],
      }
    }

    case ActionType.UpdateElement: {
      const newState = saveHistory(state)
      return {
        ...newState,
        elements: newState.elements.map((element) =>
          element.id === action.id ? { ...element, ...action.changes } : element,
        ),
      }
    }

    case ActionType.DeleteElement: {
      const newState = saveHistory(state)
      return {
        ...newState,
        elements: newState.elements.filter((element) => !action.ids.includes(element.id)),
        selectedElementIds: newState.selectedElementIds.filter((id) => !action.ids.includes(id)),
      }
    }

    case ActionType.SelectElement: {
      return {
        ...state,
        selectedElementIds: action.ids,
      }
    }

    case ActionType.ClearSelection: {
      return {
        ...state,
        selectedElementIds: [],
      }
    }

    case ActionType.MoveElement: {
      const newState = saveHistory(state)
      return {
        ...newState,
        elements: newState.elements.map((element) =>
          action.ids.includes(element.id)
            ? { ...element, x: element.x + action.dx, y: element.y + action.dy }
            : element,
        ),
      }
    }

    case ActionType.ResizeElement: {
      const newState = saveHistory(state)
      return {
        ...newState,
        elements: newState.elements.map((element) =>
          element.id === action.id
            ? {
                ...element,
                width: action.width,
                height: action.height,
                x: action.x,
                y: action.y,
              }
            : element,
        ),
      }
    }

    case ActionType.RotateElement: {
      const newState = saveHistory(state)
      return {
        ...newState,
        elements: newState.elements.map((element) =>
          element.id === action.id ? { ...element, rotation: action.rotation } : element,
        ),
      }
    }

    case ActionType.BringForward: {
      const newState = saveHistory(state)
      const elementToMove = newState.elements.find((el) => el.id === action.id)
      if (!elementToMove) return state

      const elementsAbove = newState.elements
        .filter((el) => el.zIndex > elementToMove.zIndex)
        .sort((a, b) => a.zIndex - b.zIndex)

      if (elementsAbove.length === 0) return state

      const nextElement = elementsAbove[0]
      const newZIndex = nextElement.zIndex

      return {
        ...newState,
        elements: newState.elements.map((element) => {
          if (element.id === action.id) {
            return { ...element, zIndex: newZIndex }
          }
          if (element.id === nextElement.id) {
            return { ...element, zIndex: elementToMove.zIndex }
          }
          return element
        }),
      }
    }

    case ActionType.SendBackward: {
      const newState = saveHistory(state)
      const elementToMove = newState.elements.find((el) => el.id === action.id)
      if (!elementToMove) return state

      const elementsBelow = newState.elements
        .filter((el) => el.zIndex < elementToMove.zIndex)
        .sort((a, b) => b.zIndex - a.zIndex)

      if (elementsBelow.length === 0) return state

      const prevElement = elementsBelow[0]
      const newZIndex = prevElement.zIndex

      return {
        ...newState,
        elements: newState.elements.map((element) => {
          if (element.id === action.id) {
            return { ...element, zIndex: newZIndex }
          }
          if (element.id === prevElement.id) {
            return { ...element, zIndex: elementToMove.zIndex }
          }
          return element
        }),
      }
    }

    case ActionType.BringToFront: {
      const newState = saveHistory(state)
      const maxZIndex = Math.max(...newState.elements.map((el) => el.zIndex)) + 1

      return {
        ...newState,
        elements: newState.elements.map((element) =>
          element.id === action.id ? { ...element, zIndex: maxZIndex } : element,
        ),
      }
    }

    case ActionType.SendToBack: {
      const newState = saveHistory(state)
      const minZIndex = Math.min(...newState.elements.map((el) => el.zIndex)) - 1

      return {
        ...newState,
        elements: newState.elements.map((element) =>
          element.id === action.id ? { ...element, zIndex: minZIndex } : element,
        ),
      }
    }

    case ActionType.SetZoom: {
      return {
        ...state,
        zoom: action.zoom,
      }
    }

    case ActionType.SetPan: {
      return {
        ...state,
        panOffset: { x: action.x, y: action.y },
      }
    }

    case ActionType.Undo: {
      if (state.history.past.length === 0) return state

      const newPast = [...state.history.past]
      const previousState = newPast.pop()

      if (!previousState) return state

      return {
        ...previousState,
        history: {
          past: newPast,
          future: [
            {
              ...state,
              history: { past: [], future: [] },
            },
            ...state.history.future,
          ],
        },
      }
    }

    case ActionType.Redo: {
      if (state.history.future.length === 0) return state

      const newFuture = [...state.history.future]
      const nextState = newFuture.shift()

      if (!nextState) return state

      return {
        ...nextState,
        history: {
          past: [
            ...state.history.past,
            {
              ...state,
              history: { past: [], future: [] },
            },
          ],
          future: newFuture,
        },
      }
    }

    default:
      return state
  }
}
