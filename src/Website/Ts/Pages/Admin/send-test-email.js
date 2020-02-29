import { Html, Div, h1, t, hr, form, event, div, label, input, attr, textarea, formButton, br } from '../../Framework/renderer';
import { FormHelper } from '../../Framework/forms';
import { AdminLink } from './_admin-link-creator';
import { registerPage } from '../../Framework/router';

/**
 * Page for trying out the email service
 * @constructor
 */
function SendTestEmailPage() {
    this.formHelper = new FormHelper();
    this.link = new AdminLink();
}

SendTestEmailPage.prototype = {
    renderPage: function() {
        new Html([
            Div(
                h1(
                    t('Send test email?')
                ),
                hr(),
                form(
                    event('submit', e => this.formHelper.handleSubmit(e, '/Admin/email_test', true, this.link.testEmailSent())),
                    div(
                        label(
                            t('to')
                        ),
                        br(),
                        input(
                            event('input', e => this.formHelper.validateForm(e)),
                            attr({
                                type: 'text',
                                value: 'northernliondb@gmail.com',
                                name: 'To',
                                required: 'true'
                            })
                        )
                    ),
                    div(
                        label(
                            t('subject')
                        ),
                        br(),
                        input(
                            event('input', e => this.formHelper.validateForm(e)),
                            attr({
                                type: 'text',
                                value: 'test email',
                                name: 'Subject',
                                required: 'true'
                            })
                        )
                    ),
                    div(
                        label(
                            t('html message')
                        ),
                        br(),
                        textarea(
                            event('input', e => this.formHelper.validateForm(e)),
                            t('<div><h1>Test!</h1></div>'),
                            attr({
                                name: 'HtmlMessage',
                                required: 'true'
                            })
                        )
                    ),
                    formButton(
                        t('Send Test Email')
                    )
                )
            )
        ])
    }
};

function registerSendTestEmailPage() {
    registerPage(SendTestEmailPage, 'Send Test Email', ['Admin', 'SendTestEmail']);
}

export {
    SendTestEmailPage,
    registerSendTestEmailPage
}