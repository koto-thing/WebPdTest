import { useEffect, useRef, useState } from "react";
import { WebPdWorkletNode, registerWebPdWorkletNode } from "@webpd/runtime";
import parse from "@webpd/pd-parser";

interface PatchPlayerProps {
  patchFilePath: string;
}

const PatchPlayer = ({ patchFilePath }: PatchPlayerProps) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const nodeRef = useRef<WebPdWorkletNode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [parsedPatch, setParsedPatch] = useState<Record<string, unknown> | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  useEffect(() => {
    const setup = async () => {
      if (!patchFilePath) return;
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      const audioContext = new window.AudioContext();
      await registerWebPdWorkletNode(audioContext);
      const node = new WebPdWorkletNode(audioContext);
      node.connect(audioContext.destination);
      audioContextRef.current = audioContext;
      nodeRef.current = node;
      // パッチファイルをfetchしてパース
      const res = await fetch(patchFilePath);
      const patchText = await res.text();
      const result = parse(patchText);
      if (result.status !== 0) {
        const errorMessages = Array.isArray(result.errors)
          ? result.errors.map((e) => typeof e === 'object' && e && 'message' in e ? String((e as { message: unknown }).message) : String(e)).join("\n")
          : "パースエラー";
        setParseError(errorMessages);
        setParsedPatch(null);
      } else {
        setParsedPatch(result.pd as Record<string, unknown>);
        setParseError(null);
      }
      audioContext.suspend();
      setIsPlaying(false);
    };
    setup();
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      nodeRef.current = null;
    };
  }, [patchFilePath]);

  const handlePlay = async () => {
    if (audioContextRef.current && audioContextRef.current.state !== "running") {
      await audioContextRef.current.resume();
      setIsPlaying(true);
    }
  };

  const handleStop = async () => {
    if (audioContextRef.current && audioContextRef.current.state === "running") {
      await audioContextRef.current.suspend();
      setIsPlaying(false);
    }
  };

  return (
    <div>
      <h2>Patch Player</h2>
      <p>Playing patch from: {patchFilePath}</p>
      <button onClick={handlePlay} disabled={isPlaying}>再生</button>
      <button onClick={handleStop} disabled={!isPlaying}>停止</button>
      <h3>パース結果（JSオブジェクト）</h3>
      {parseError ? (
        <div style={{color: 'red'}}>パースエラー: {parseError}</div>
      ) : (
        <pre style={{maxHeight: 300, overflow: 'auto', background: '#eee', fontSize: 12}}>
          {parsedPatch ? JSON.stringify(parsedPatch, null, 2) : 'パース中...'}
        </pre>
      )}
    </div>
  );
};

export default PatchPlayer;
