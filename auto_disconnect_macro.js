// Cisco RoomOS Macro - AI-Assisted BRB / Auto Disconnect Workflow
// Concept: Automatically disconnect active calls if room becomes vacant
// after a defined timeout period to improve meeting confidentiality.

const xapi = require('xapi');

const VACANT_TIMEOUT = 300000; // 5 minutes in milliseconds
let vacancyTimer = null;

// Listen for room occupancy status
xapi.Status.RoomAnalytics.PeoplePresence.on((status) => {
  
  console.log(`Room Presence Status: ${status}`);

  if (status === 'No') {

    console.log('Room vacant detected. Starting timeout countdown...');

    vacancyTimer = setTimeout(async () => {

      try {
        // Check active calls
        const calls = await xapi.Status.Call.get();

        if (calls.length > 0) {

          console.log('No occupancy detected. Disconnecting active calls for confidentiality.');

          // Disconnect all active calls
          for (const call of calls) {
            await xapi.Command.Call.Disconnect({ CallId: call.id });
          }

          // Optional: Display notification on room device
          await xapi.Command.UserInterface.Message.Alert.Display({
            Title: 'Meeting Ended',
            Text: 'Call disconnected automatically due to room vacancy.',
            Duration: 10
          });
        }

      } catch (error) {
        console.error(`Error disconnecting call: ${error}`);
      }

    }, VACANT_TIMEOUT);

  } else {

    console.log('Occupancy detected. Cancelling disconnect timer.');

    // Cancel timeout if someone re-enters room
    if (vacancyTimer) {
      clearTimeout(vacancyTimer);
      vacancyTimer = null;
    }
  }
});
