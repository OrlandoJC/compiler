export const timerMessage = (holder, message, time) => {
    holder.textContent = message;

    setTimeout(() => {
        holder.textContent = "";
    }, time)
}