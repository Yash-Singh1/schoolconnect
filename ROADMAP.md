## Step 1

- Cleanup constants and secrets
- Create routing system
  - Logged in first of all (validate checking store and backend ping github)
  - Implement bottom navbar with
    - Calendar (should allow changing mode, month/day/week probably some component for that) maybe google calendar? but we need to implement our own API we'll see
    - Absence Reporting, simple form allowing us to report absence
    - Classes page allowing us to go into a class and see the board with announcements and photos
    - Info page with some info about about the app
- Documentation in README
- Figure out how to deploy to Google Play Store

## Step 2

Implement Roles system

- I should have I am a teacher, I am a student, I am a parent, I am a admin option in login
- Teachers:
  - Classes and board
  - Can create classes
  - Can modify members of classes
- Admin:
  - Can create members and mark their roles
  - Can view all classes
  - Can modify schedule
- Students:
  - Can view classes
  - Can view grades
- Parents:
  - Can view grades
  - Can view absence reporting

All can view info and calendar

### Info Page

Info page should contain some terms of service generated and MIT license. Also links to twitter account of the project and maybe brand guidelines link.

Also, we need notifications for events
