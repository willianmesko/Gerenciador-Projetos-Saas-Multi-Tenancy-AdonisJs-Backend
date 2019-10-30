'use strict'

const User = use('App/Models/User')
const Invite = use('App/Models/Invite')

class UserController {
  async store ({ request, response, auth }) {
    const data = request.only(['name', 'email', 'password'])

    // Searching invites for user invited
    const teamsQuery = Invite.query().where('email', data.email)
    // Get all teams id for user invited
    const teams = await teamsQuery.pluck('team_id')

    if (teams.length === 0) {
      return response.status(401).send({ message: "You're not invited to any team" })
    }
    // Register the user
    const user = await User.create(data)
    // Attach all the invites registered for him
    await user.teams().attach(teams)
    // Remove founded invites
    await teamsQuery.delete()
    // Authenticate the user
    const token = await auth.attempt(data.email, data.password)

    return token
  }
}

module.exports = UserController
