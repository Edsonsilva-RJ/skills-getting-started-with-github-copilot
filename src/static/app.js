document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Participants list HTML
          let participantsHTML = "";
          if (details.participants && details.participants.length > 0) {
            participantsHTML = `
              <div class="participants-section">
                <strong>Participants (${details.participants.length}):</strong>
                <ul class="participants-list no-bullets">
                  ${details.participants.map(email => `
                    <li class="participant-item">
                      <span class="participant-email">${email}</span>
                      <button class="delete-participant" title="Remove participant" data-activity="${name}" data-email="${email}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#ffebee"/><path d="M9.5 9.5l5 5m0-5l-5 5" stroke="#c62828" stroke-width="2" stroke-linecap="round"/></svg>
                      </button>
                    </li>
                  `).join("")}
                </ul>
              </div>
            `;
          } else {
            participantsHTML = `
              <div class="participants-section empty">
                <em>No participants yet.</em>
              </div>
            `;
          }

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          ${participantsHTML}
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
       
       // Adiciona listeners para os botões de exclusão após inserir o card
       const deleteButtons = activityCard.querySelectorAll('.delete-participant');
       deleteButtons.forEach(btn => {
         btn.addEventListener('click', async (e) => {
           e.preventDefault();
           const activityName = btn.getAttribute('data-activity');
           const email = btn.getAttribute('data-email');
           if (!activityName || !email) return;
           if (!confirm(`Remove ${email} from ${activityName}?`)) return;
           try {
             const response = await fetch(`/activities/${encodeURIComponent(activityName)}/unregister?email=${encodeURIComponent(email)}`, {
               method: 'POST',
             });
             const result = await response.json();
             if (response.ok) {
               fetchActivities(); // Atualiza a lista
             } else {
               alert(result.detail || 'Failed to remove participant.');
             }
           } catch (error) {
             alert('Error removing participant.');
           }
         });
       });
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        fetchActivities(); // Atualiza a lista de atividades imediatamente
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
