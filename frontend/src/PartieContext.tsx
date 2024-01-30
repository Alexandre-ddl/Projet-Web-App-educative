import React from "react"
import { Partie } from "./dto/Partie"

export interface PartieContextProps {
    partie:Partie|null
    setPartie: (partie:Partie|null) => void
}

export const PartieContext = React.createContext<PartieContextProps>({partie: null, setPartie:(u) => {}})