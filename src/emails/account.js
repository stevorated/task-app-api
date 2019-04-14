sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SG_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'yaalla@dib.il.com.here',
        subject: 'Thanks for Joining!',
        text: `Welcome to this app, ${name}. Ti Alla Toje!`
    })
}

const sendGoodbyeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'yaalla@dib.il.com.here',
        subject: 'Sorry to see you go.',
        text: `${name} why u leaving? Ti ni Alla!`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendGoodbyeEmail
}