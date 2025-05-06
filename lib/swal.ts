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
