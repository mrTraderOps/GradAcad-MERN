import { useState } from "react";

export const usePopupVisibility = () => {
    const [isPopupVisible, setPopupVisible] = useState(false);

    const openPopup = () => setPopupVisible(true);
    const closePopup = () => setPopupVisible(false);

    return { isPopupVisible, openPopup, closePopup };
}