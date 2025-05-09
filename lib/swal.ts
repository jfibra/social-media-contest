// This is a utility file for SweetAlert2 functions
import Swal from "sweetalert2"

export const showErrorAlert = (message: string) => {
  return Swal.fire({
    title: "Error",
    text: message,
    icon: "error",
    confirmButtonText: "OK",
    confirmButtonColor: "#1a5276",
  })
}

export const showSuccessAlert = (message: string) => {
  return Swal.fire({
    title: "Success",
    text: message,
    icon: "success",
    confirmButtonText: "OK",
    confirmButtonColor: "#1a5276",
  })
}

export const showInfoAlert = (message: string) => {
  return Swal.fire({
    title: "Information",
    text: message,
    icon: "info",
    confirmButtonText: "OK",
    confirmButtonColor: "#1a5276",
  })
}

export const showConfirmAlert = (title: string, text: string) => {
  return Swal.fire({
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes",
    cancelButtonText: "No",
    confirmButtonColor: "#1a5276",
    cancelButtonColor: "#d33",
  })
}

export const showLoadingAlert = (title = "Processing") => {
  return Swal.fire({
    title,
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading()
    },
  })
}

export const closeAlert = () => {
  Swal.close()
}

export const showApiErrorAlert = (error: any) => {
  let message = "An unexpected error occurred"

  if (error instanceof Error) {
    message = error.message
  } else if (typeof error === "string") {
    message = error
  } else if (error && typeof error === "object" && "message" in error) {
    message = String(error.message)
  }

  return showErrorAlert(message)
}

// Adding new function names as aliases to maintain backward compatibility
export const showError = showErrorAlert
export const showSuccess = showSuccessAlert
export const showInfo = showInfoAlert
export const showConfirm = showConfirmAlert
export const showLoading = showLoadingAlert
