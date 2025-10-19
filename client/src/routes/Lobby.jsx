import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import "./Lobby.css"

function Lobby(){
  const navigate = useNavigate()
  const [meetingId, setMeetingId] = useState(null)
  const [meetingLink, setMeetingLink] = useState(null)
  const [copyMsg, setCopyMsg] = useState("")
  const [joinId, setJoinId] = useState("")
  const [joinError, setJoinError] = useState("")

  const generateMeetingId = () => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID()
    }
    return `meet-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`
  }

  const handleCreateMeetingId = () => {
    const id = generateMeetingId()
    setMeetingId(id)
    setMeetingLink(null)
    navigate(`/room/${id}`)
  }

  const handleCreateLink = async () => {
    const id = generateMeetingId()
    const link = `${window.location.origin}/room/${id}`
    setMeetingLink(link)
    setMeetingId(id)
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(link)
        setCopyMsg("Link copied to clipboard")
      } else {
        setCopyMsg("Copy not supported in this browser")
      }
    } catch (e) {
      setCopyMsg("Failed to copy")
    }
  }

  const handleJoin = (e) => {
    e.preventDefault()
    const id = (joinId || "").trim()
    if (!id) {
      setJoinError("Please enter a meeting ID")
      return
    }
    setJoinError("")
    setMeetingId(null)
    setMeetingLink(null)
    navigate(`/room/${id}`)
  }

  return(
    <>
      <div className="lobby-container">
        <h1 className="app-title">Meet4Us</h1>

        <div className="lobby-card">
          <h2 className="card-title">Create meeting</h2>
          <p className="card-sub">Start a new meeting and invite others with the meeting link or an ID.</p>

          <div className="control-row">
            <button className="btn btn-primary" aria-label="Create Meeting ID" onClick={handleCreateMeetingId}>
              Create Meeting ID
            </button>

            <button className="btn" aria-label="Create Link" onClick={handleCreateLink}>
              Create Link
            </button>
          </div>

          {meetingId && (
            <div className="meeting-info">
              <div className="meeting-id"><strong>ID:</strong> {meetingId}</div>
              {meetingLink && (
                <div className="meeting-link">
                  <strong>Link:</strong> <a href={meetingLink}>{meetingLink}</a>
                </div>
              )}
              {copyMsg && <div className="copy-msg">{copyMsg}</div>}
            </div>
          )}
        </div>

        <div className="lobby-card">
          <h2 className="card-title">Join meeting</h2>
          <p className="card-sub">Enter the meeting ID to join.</p>

          <form onSubmit={handleJoin} className="join-form">
            <input
              className="input"
              aria-label="Meeting ID"
              placeholder="Meeting ID"
              value={joinId}
              onChange={(e) => setJoinId(e.target.value)}
            />
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" aria-label="Join Meeting">Join Meeting</button>
              <button
                type="button"
                className="btn"
                onClick={() => { setJoinId(""); setJoinError(""); }}
                aria-label="Clear"
              >
                Clear
              </button>
            </div>
            {joinError && <div className="error-msg">{joinError}</div>}
          </form>
        </div>
      </div>
    </>
  )
}
export default Lobby