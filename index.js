/*Maybe an event schedule? Add events (w/ descriptions of performances),
and a spot to sign up to work said events? Name & phone number of 
volunteer. Then you can delete the event after it's finished, or remove
a volunteer.
 https://6400eca4ab6b7399d09df8ab.mockapi.io/events/eventList

going to create a few different classes. One for the event (headliner), 
one for volunteers (name, phone #), event service (enable us to send http
  and ajax requests to the pre-existing API), and a class to manage the 
  DOM (instead of rewriting parts, we will clear that "app" div out every 
  time, and re-populate the houses).

  Just cuz i feel weird, maybe at the top (or on a main page), explain how
  if you agree to volunteer to help with events, you get exclusive VIP access
  w/ the headliner afterwards. It's a fair and square trade lol, not JUST
  free labor.
*/

class Event {
  constructor(headliner) {
    this.headliner = headliner;
    this.volunteers = [];
  }

  addVolunteer(name, phoneNumber, id) {
    this.volunteers.push(new Volunteer(name, phoneNumber, id));
  }
}

class Volunteer {
  static count = 0;//give each volunteer an id. s.o. Kristina
  constructor(name, phoneNumber, id) {
    this.name = name;
    this.phoneNumber = phoneNumber;
    this.id = Volunteer.count++;
  }
}

class EventService {
  //can maybe rename later

  static url = "https://6400eca4ab6b7399d09df8ab.mockapi.io/events/eventList"; //what is static??

  static getAllEvents() {
    //no parameters- just returns all events
    return $.get(this.url); //return all events from this url
  }

  static getEvent(id) {
    //id of specific event we want to retrive from API
    return $.get(this.url + `/${id}`);
  }

  static createEvent(event) {
    //takes an instance of event class-name & array
    return $.post(this.url, event); //adding (posting) event payload to API
  } //returning all so when we use these methods, we can handle promise that
  //comes back.

  static updateEvent(event) {
    //no idea what's happening here lol
    return $.ajax({
      //object
      url: this.url + `/${event.id}`,
      dataType: "json",
      data: JSON.stringify(event),
      contentType: "application/json",
      type: "PUT", //http verb
    });
  }

  static deleteEvent(id) {
    //this id we want to delete.
    return $.ajax({
      url: this.url + `/${id}`,
      type: "DELETE", //http verb
    });
  }
}

class DOMManager {
  static events; //"events" to represent all events in this class

  static getAllEvents() {
    //calls getAllEvents() in EventService
    EventService.getAllEvents().then((events) => this.render(events)); //getAllEvents() returns a promise, so add the .then for it
  }

  static deleteEvent(id) {
    EventService.deleteEvent(id)
      .then(() => {
        return EventService.getAllEvents();
      })
      .then((events) => this.render(events));
  }

  static createEvent(headliner) {
    EventService.createEvent(new Event(headliner))
      .then(() => {
        return EventService.getAllEvents();
      })
      .then((events) => this.render(events));
  }

  static addVolunteer(id) {
    //console.log(i);
    for (let event of this.events) {
      //console.log(event);
      if (event.id == id) {
        event.volunteers.push(
          new Volunteer(
            $(`#${event.id}-volunteer-name`).val(),
            $(`#${event.id}-volunteer-phone-number`).val(),
          )
        );
        EventService.updateEvent(event)
          .then(() => {
            return EventService.getAllEvents();
          })
          .then((events) => this.render(events));
      }
    }
    //console.log(this.events);
  }

  static deleteVolunteer(eventId, volunteerId) {
    for (let event of this.events) {
      if (event.id == eventId) {
        //console.log(eventId, event.id);
        for (let volunteer of event.volunteers) {
          console.log(event.volunteers); //maybe put loop in here?

          if (volunteer.id == volunteerId) {
            //console.log(volunteer.id, volunteerId);
            event.volunteers.splice(event.volunteers.indexOf(volunteer), 1);
            EventService.updateEvent(event)
              .then(() => {
                return EventService.getAllEvents();
              })
              .then((events) => this.render(events));
          }
        }
      }
    }
  }

  static render(events) {
    this.events = events;
    //console.log(events);
    $("#app").empty();
    for (let event of events) {
      //console.log(event);
      $("#app").prepend(
        //had event.headliner on line 135, which didnt exist.
        `<div id = "${event.id}" class = "card">
          <div class = "card-header">
          <h2><b>${event.headliner}</b></h2>
          <button class = "btn btn-danger" onclick = "DOMManager.deleteEvent('${event.id}')">Delete</button>
          </div>
          <div class = "card-body">
          <div class = "card">
          <div class = "row">
          <div class = "col-sm">
          <input type = "text" id = "${event.id}-volunteer-name" class = "form-control" placeholder = "Volunteer Name">
          </div>
          <div class = "col-sm">
          <input type = "text" id = "${event.id}-volunteer-phone-number" class = "form-control" placeholder = "Volunteer Phone Number">
          </div>
          </div>
          <button id = "${event.id}-new-volunteer" onclick = "DOMManager.addVolunteer('${event.id}')" class = "btn btn-dark form-control">Add</button>
          </div>
          </div>
          </div><br>`
      );

      for (let volunteer of event.volunteers) {
        //issue here. my volunteers dont have id's. this "event" refers to the one we're looking at in that moment
        $(`#${event.id}`)
          .find(".card-body")
          .append(
            `<p>
            <span id = "volunteer-name-${volunteer.id}"><b>Volunteer Name: </b>${volunteer.name}</span>
            <span id = "volunteer-phone-number-${volunteer.id}"><b>Volunteer Phone Number: </b>${volunteer.phoneNumber}</span>
            <button class = "btn btn-danger" onclick = "DOMManager.deleteVolunteer('${event.id}', '${volunteer.id}')">Remove Volunteer</button></p>
            `
          );
      }
    }
  }
} //dommanager

$("#create-new-event").click(() => {
  DOMManager.createEvent($("#new-event-name").val());
  document.getElementById("new-event-name").value = "";//jquery didnt work for this one?
});

DOMManager.getAllEvents();

