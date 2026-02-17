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

    // Render the star rating component with 5 stars, applying appropriate styles based on the current value and hover state
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((rating) => (
                <button
                    key={rating}
                    type="button"
                    className={`text-3xl transition-colors ${
                        readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
                    }`}
                    onClick={() => handleClick(rating)}
                    onMouseEnter={() => handleMouseEnter(rating)}
                    onMouseLeave={handleMouseLeave}
                    disabled={readonly}
                    >
                        <span
                        className={
                            rating <= (hoverValue || value)
                            ? 'text-yellow-400'
                            : 'text-gray-600'
                        }
                        >
                            ★
                        </span>
                    </button>

            ))}
        </div>
    )

}

export default StarRating;
