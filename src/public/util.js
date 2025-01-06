export function elementExists(elementCategory, elementId) {
    if ($w(elementCategory).some((obj) => obj.id === elementId)) {
        return true;
    } else {
        return false;
    }    
}