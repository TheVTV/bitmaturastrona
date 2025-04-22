import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function DownloadPage() {
  const [selectedFileSheet, setSelectedFileSheet] = useState<File | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [discord, setDiscord] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<string | null>(null);
  const [showButtons, setShowButtons] = useState<boolean>(false);
  const navigate = useNavigate();

  // Helper function to decode Base64-encoded strings with UTF-8 support
  const decodeBase64 = (base64: string) => {
    try {
      return decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, "0")}`)
          .join("")
      );
    } catch (error) {
      console.error("Error decoding Base64 string:", error);
      return null;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/"); // Redirect to login page if not logged in
    } else {
      try {
        const targetDate = new Date("2025-04-25T16:30:00").getTime();
        const now = Date.now();
        const timeLeft = targetDate - now;

        if (timeLeft <= 0) {
          setShowButtons(true);
        }

        const base64Payload = token.split(".")[1];
        const decodedPayload = decodeBase64(base64Payload);
        if (decodedPayload) {
          const payload = JSON.parse(decodedPayload);
          setUserId(payload.id);
          setName(payload.firstname + " " + payload.lastname);
          setEmail(payload.email);
          setDiscord(payload.discord);
          setIsOnline(payload.online);
        } else {
          throw new Error("Failed to decode token payload.");
        }
      } catch (error) {
        console.error("Invalid token:", error);
        navigate("/login"); // Redirect to login page if token is invalid
      }
    }
  }, [navigate]);

  useEffect(() => {
    const targetDate = new Date("2025-04-25T16:30:00").getTime();

    const interval = setInterval(() => {
      const now = Date.now();
      const timeLeft = targetDate - now;

      if (timeLeft <= 0) {
        clearInterval(interval);
        setCountdown(null);
        setShowButtons(true); // Show buttons after countdown ends
      } else {
        var days = Math.floor(timeLeft / (1000 * 60 * 60 * 24)) + "d";
        var hours =
          Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)) +
          "h";
        var minutes =
          Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60)) + "m";
        var seconds = Math.floor((timeLeft % (1000 * 60)) / 1000) + "s";

        if (days === "0d") {
          days = "";
        }
        if (hours === "0h") {
          hours = "";
        }
        if (minutes === "0m") {
          minutes = "";
        }
        if (seconds === "0s") {
          seconds = "";
        }

        setCountdown(`${days} ${hours} ${minutes} ${seconds}`);
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const handleSheetChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFileSheet(event.target.files ? event.target.files[0] : null);
  };

  const handleFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(event.target.files);
  };

  const handleSendSheet = async () => {
    if (!selectedFileSheet) {
      alert("Wybierz plik arkusza do wysłania.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("User is not authenticated.");
      }

      const sheetFormData = new FormData();
      sheetFormData.append("file", selectedFileSheet);

      const response = await fetch(
        "https://bitserwer-4884a3bf6321.herokuapp.com/upload/sheet",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: sheetFormData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Wysłanie arkusza nie powiodło się: ${errorText}`);
      }

      alert("Arkusz został pomyślnie wysłany.");
    } catch (error: any) {
      console.error("Błąd podczas wysyłania arkusza:", error);
      alert(error.message || "Wystąpił błąd podczas wysyłania arkusza.");
    }
  };

  const handleSendFiles = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      alert("Wybierz plik do wysłania.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("User is not authenticated.");
      }

      const filesFormData = new FormData();
      Array.from(selectedFiles).forEach((file) => {
        filesFormData.append("files", file);
      });

      const response = await fetch(
        "https://bitserwer-4884a3bf6321.herokuapp.com/upload/files",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: filesFormData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Wysłanie pliku nie powiodło się: ${errorText}`);
      }

      alert("Plik został pomyślnie wysłany.");
    } catch (error: any) {
      console.error("Błąd podczas wysyłania pliku:", error);
      alert(error.message || "Wystąpił błąd podczas wysyłania pliku.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  return (
    <div className="download-page">
      <h1>Witaj {userId}!</h1>
      <p>
        Twoje dane: {name}, {email}, {discord}
      </p>
      <button onClick={handleLogout}>Logout</button>
      <div className="flex-container">
        <div className="download-section">
          {showButtons == false ? (
            <>
              <p>Do rozpoczęcia matury pozostało:</p>
              <div
                className="countdown"
                style={{ color: "red", fontSize: "1.5em", fontWeight: "bold" }}
              >
                {`${countdown}`}
              </div>
            </>
          ) : (
            <>
              <h2>Pobieranie plików</h2>
              <a href="/bitmaturastrona/arkusz.pdf" download>
                <button>Pobierz arkusz</button>
              </a>
              <a href="/bitmaturastrona/pliki.zip" download>
                <button>Pobierz pliki</button>
              </a>
            </>
          )}
        </div>
        {showButtons == false ? (
          <></>
        ) : (
          <>
            <div className="file-upload-section">
              <h2>Przesyłanie odpowiedzi</h2>
              <div className="file-upload-container">
                {isOnline && (
                  <div className="upload-sheet">
                    <h3>Arkusz</h3>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleSheetChange}
                    />
                    <button onClick={handleSendSheet}>Wyślij arkusz</button>
                  </div>
                )}
                <div className="upload-files">
                  <h3>Pliki</h3>
                  <input
                    type="file"
                    accept=".zip,.rar,.7z"
                    multiple
                    onChange={handleFilesChange}
                  />
                  <button onClick={handleSendFiles}>Wyślij pliki</button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      {showButtons == false ? (
        <></>
      ) : (
        <>
          <div className="info-section">
            <h2>Informacje</h2>
            <p>
              Po przesłaniu odpowiedzi przez panel prosimy również o wysłanie
              plików na adres:
            </p>
            <p style={{ fontWeight: "bold", fontSize: "1.2em" }}>
              maturaxdiament@agh.edu.pl
            </p>
            <p>
              W tytule wiadomości prosimy wpisać tylko i wyłącznie swój numer
              identyfikacyjny
            </p>
            <p style={{ color: "red" }}>
              Proszę nie udostępniać plików innym osobom!
            </p>
            <p style={{ color: "red" }}>
              Wszystkie pliki są chronione prawem autorskim!
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default DownloadPage;
