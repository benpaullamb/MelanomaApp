
export default {
    bodyParts: ['Back', 'Front Torso', 'Right Arm', 'Left Arm', 'Right Leg', 'Left Leg', 'Head'],

    toPercentage: decimal => {
        if (!decimal) return '0%';
        return `${(decimal * 100).toFixed(2)}%`
    }
}