import { useState } from "react";
import toast from "react-hot-toast";
import CodeEditor from "../components/CodeEditor.jsx";
import OutputPanel from "../components/OutputPanel.jsx";
import LanguageSelector from "../components/LanguageSelector.jsx";
import {STARTER_CODE} from "../constants/language.js";
import {
    translatedCode,
    analyzeComplexity,
    otimizeCode,
    explainCode
} from "..services/service.js";

import "styles/home.css";

const ACTIONS = ['translate', 'analyze', 'otimize', 'explain'];

function HomePage() {
    const [code, setCode] = useState(STARTER_CODE['python']);
    const [sourcelanguage, setSourceLanguage] = useState('python');
    const [targetlanguage, setTargetLanguage] = useState('javascript');
    const [activeAction, setActiveAction] = useState('translate');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleSourceChange = (langID) => {
        setSourceLanguage(langID);
        if (STARTER_CODE[langID]) {
            setCode(STARTER_CODE[langID]);
        }
        setResult(null);
    }

}