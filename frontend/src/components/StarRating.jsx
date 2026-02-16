import { useState } from "react";

// Function star rating component with hover effect and read-only mode
function StarRating({ value, onChange, readonly = false }) {
    // State to track the current hover value for the star rating
    const [hoverValue, setHoverValue] = useState(0);

    // Function to handle click events on the start rating component
    const handleClick = (rating) => {
        if (!readonly && onChange) {
            onChange(rating)
        }
    }

    // Function to handle mouse enter events on the star rating component
    const handleMouseEnter = (rating) => {
        if (!readonly) {
            setHoverValue(rating)
        }
    }

    // Function to handle mouse leave events on the star rating component
    const handleMouseLeave = () => {
        setHoverValue(0)
    }

}
    