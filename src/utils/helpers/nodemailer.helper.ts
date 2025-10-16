import nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

// Define a reusable function to send OTP emails
export async function otpMailer(email: string, otp: string, fullname: string): Promise<void> {
    // Setup transporter using SMTP config for better reliability than 'service'
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const today = new Date();

    const day = today.getDate();
    const month = months[today.getMonth()];
    const year = today.getFullYear();

    const formattedDate = `${day} ${month}, ${year}`;

    // Use SMTP transport with configurable host/port/secure
    const transporter: Transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: Number(process.env.EMAIL_PORT) || 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER as string,
            pass: process.env.EMAIL_PASS as string,
        },
        connectionTimeout: 15000, // 15 seconds
        greetingTimeout: 10000,   // 10 seconds
        socketTimeout: 20000      // 20 seconds
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Webtray Registration',
        html: `
    <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <meta http-equiv="X-UA-Compatible" content="ie=edge" />
            <title>Static Template</title>

            <link
            href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap"
            rel="stylesheet"
            />
        </head>
        <body
            style="
            margin: 0;
            font-family: 'Poppins', sans-serif;
            background: #ffffff;
            font-size: 14px;
            "
        >
            <div
            style="
                max-width: 680px;
                margin: 0 auto;
                padding: 45px 30px 60px;
                background: #f4f7ff;
                background-image: url(https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661497957196_595865/email-template-background-banner);
                background-repeat: no-repeat;
                background-size: 800px 452px;
                background-position: top center;
                font-size: 14px;
                color: #434343;
            "
            >
            <header>
                <table style="width: 100%;">
                <tbody>
                    <tr style="height: 0;">
                    <td>
                        <img
                        alt=""
                        src=""
                        height="30px"
                        />
                    </td>
                    <td style="text-align: right;">
                        <span
                        style="font-size: 16px; line-height: 30px; color: #ffffff;"
                        >${formattedDate}</span
                        >
                    </td>
                    </tr>
                </tbody>
                </table>
            </header>

            <main>
                <div
                style="
                    margin: 0;
                    margin-top: 70px;
                    padding: 92px 30px 115px;
                    background: #ffffff;
                    border-radius: 30px;
                    text-align: center;
                "
                >
                <div style="width: 100%; max-width: 489px; margin: 0 auto;">
                    <h1
                    style="
                        margin: 0;
                        font-size: 24px;
                        font-weight: 500;
                        color: #1f1f1f;
                    "
                    >
                    Your OTP
                    </h1>
                    <p
                    style="
                        margin: 0;
                        margin-top: 17px;
                        font-size: 16px;
                        font-weight: 500;
                    "
                    >
                    Hey ${fullname},
                    </p>
                    <p
                    style="
                        margin: 0;
                        margin-top: 17px;
                        font-weight: 500;
                        letter-spacing: 0.56px;
                    "
                    >
                    Thank you for choosing Webtray. Use the following OTP
                    to complete your registration process. OTP is
                    valid for
                    <span style="font-weight: 600; color: #1f1f1f;">1 minutes</span>.
                    Do not share this code with others
                    </p>
                    <p
                    style="
                        margin: 0;
                        margin-top: 60px;
                        font-size: 40px;
                        font-weight: 600;
                        letter-spacing: 25px;
                        color: #ba3d4f;
                    "
                    >
                    ${otp}
                    </p>
                </div>
                </div>

                <p
                style="
                    max-width: 400px;
                    margin: 0 auto;
                    margin-top: 90px;
                    text-align: center;
                    font-weight: 500;
                    color: #8c8c8c;
                "
                >
                Need help? Ask at
                <a
                    href="https://webtray.com"
                    style="color: #499fb6; text-decoration: none;"
                    > Webtray </a
                >
                or visit our
                <a
                    href=""
                    target="_blank"
                    style="color: #499fb6; text-decoration: none;"
                    >Help Center</a
                >
                </p>
            </main>

            <footer
                style="
                width: 100%;
                max-width: 490px;
                margin: 20px auto 0;
                text-align: center;
                border-top: 1px solid #e6ebf1;
                "
            >
                <p
                style="
                    margin: 0;
                    margin-top: 40px;
                    font-size: 16px;
                    font-weight: 600;
                    color: #434343;
                "
                >
                Webtray
                </p>
                <p style="margin: 0; margin-top: 8px; color: #434343;">
                Address 40, Ahmadu Bello Way, Kano State, Nigeria.
                </p>
                <div style="margin: 0; margin-top: 16px;">
                <a href="" target="_blank" style="display: inline-block;">
                    <img
                    width="36px"
                    alt="Facebook"
                    src="https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661502815169_682499/email-template-icon-facebook"
                    />
                </a>
                <a
                    href=""
                    target="_blank"
                    style="display: inline-block; margin-left: 8px;"
                >
                    <img
                    width="36px"
                    alt="Instagram"
                    src="https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661504218208_684135/email-template-icon-instagram"
                /></a>
                <a
                    href=""
                    target="_blank"
                    style="display: inline-block; margin-left: 8px;"
                >
                    <img
                    width="36px"
                    alt="Twitter"
                    src="https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661503043040_372004/email-template-icon-twitter"
                    />
                </a>
                <a
                    href=""
                    target="_blank"
                    style="display: inline-block; margin-left: 8px;"
                >
                    <img
                    width="36px"
                    alt="Youtube"
                    src="https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661503195931_210869/email-template-icon-youtube"
                /></a>
                </div>
            </footer>
            </div>
        </body>
        </html>
    `,
    };

    await transporter.sendMail(mailOptions);
}

export async function forgotPasswordMailer(email: string, url: string): Promise<void> {

    // Use SMTP transport with configurable host/port/secure
    const transporter: Transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: Number(process.env.EMAIL_PORT) || 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER as string,
            pass: process.env.EMAIL_PASS as string,
        },
        connectionTimeout: 15000, // 15 seconds
        greetingTimeout: 10000,   // 10 seconds
        socketTimeout: 20000      // 20 seconds
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Reset Your Webtray Password',
        html: `
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
            <html xmlns="http://www.w3.org/1999/xhtml">
            <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
            <title>Verify your email address</title>
            <style type="text/css" rel="stylesheet" media="all">
                /* Base ------------------------------ */
                *:not(br):not(tr):not(html) {
                font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;
                -webkit-box-sizing: border-box;
                box-sizing: border-box;
                }
                body {
                width: 100% !important;
                height: 100%;
                margin: 0;
                line-height: 1.4;
                background-color: #F5F7F9;
                color: #839197;
                -webkit-text-size-adjust: none;
                }
                a {
                color: #414EF9;
                }

                /* Layout ------------------------------ */
                .email-wrapper {
                width: 100%;
                margin: 0;
                padding: 0;
                background-color: #F5F7F9;
                }
                .email-content {
                width: 100%;
                margin: 0;
                padding: 0;
                }

                /* Masthead ----------------------- */
                .email-masthead {
                padding: 25px 0;
                text-align: center;
                }
                .email-masthead_logo {
                max-width: 400px;
                border: 0;
                }
                .email-masthead_name {
                font-size: 16px;
                font-weight: bold;
                color: #839197;
                text-decoration: none;
                text-shadow: 0 1px 0 white;
                }

                /* Body ------------------------------ */
                .email-body {
                width: 100%;
                margin: 0;
                padding: 0;
                border-top: 1px solid #E7EAEC;
                border-bottom: 1px solid #E7EAEC;
                background-color: #FFFFFF;
                }
                .email-body_inner {
                width: 570px;
                margin: 0 auto;
                padding: 0;
                }
                .email-footer {
                width: 570px;
                margin: 0 auto;
                padding: 0;
                text-align: center;
                }
                .email-footer p {
                color: #839197;
                }
                .body-action {
                width: 100%;
                margin: 30px auto;
                padding: 0;
                text-align: center;
                }
                .body-sub {
                margin-top: 25px;
                padding-top: 25px;
                border-top: 1px solid #E7EAEC;
                }
                .content-cell {
                padding: 35px;
                }
                .align-right {
                text-align: right;
                }

                /* Type ------------------------------ */
                h1 {
                margin-top: 0;
                color: #292E31;
                font-size: 19px;
                font-weight: bold;
                text-align: left;
                }
                h2 {
                margin-top: 0;
                color: #292E31;
                font-size: 16px;
                font-weight: bold;
                text-align: left;
                }
                h3 {
                margin-top: 0;
                color: #292E31;
                font-size: 14px;
                font-weight: bold;
                text-align: left;
                }
                p {
                margin-top: 0;
                color: #839197;
                font-size: 16px;
                line-height: 1.5em;
                text-align: left;
                }
                p.sub {
                font-size: 12px;
                }
                p.center {
                text-align: center;
                }

                /* Buttons ------------------------------ */
                .button {
                display: inline-block;
                width: 200px;
                background-color: #414EF9;
                border-radius: 3px;
                color: #ffffff;
                font-size: 15px;
                line-height: 45px;
                text-align: center;
                text-decoration: none;
                -webkit-text-size-adjust: none;
                mso-hide: all;
                }
                .button--green {
                background-color: #28DB67;
                }
                .button--red {
                background-color: #FF3665;
                }
                .button--blue {
                background-color: #414EF9;
                text-color: #ffffff;
                }

                /*Media Queries ------------------------------ */
                @media only screen and (max-width: 600px) {
                .email-body_inner,
                .email-footer {
                    width: 100% !important;
                }
                }
                @media only screen and (max-width: 500px) {
                .button {
                    width: 100% !important;
                }
                }
            </style>
            </head>
            <body>
            <table class="email-wrapper" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                <td align="center">
                    <table class="email-content" width="100%" cellpadding="0" cellspacing="0">
                    <!-- Logo -->
                    <tr>
                        <td class="email-masthead">
                        <a class="email-masthead_name">Webtray</a>
                        </td>
                    </tr>
                    <!-- Email Body -->
                    <tr>
                        <td class="email-body" width="100%">
                        <table class="email-body_inner" align="center" width="570" cellpadding="0" cellspacing="0">
                            <!-- Body content -->
                            <tr>
                            <td class="content-cell">
                                <h1>Reset Your Password</h1>
                                <p>Hi there,<br>We received a request to reset your password for your Canvas account. If you made this request, please click the button below to reset your password:</p>
                                <!-- Action -->
                                <table class="body-action" align="center" width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                    <div>
                                        <!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="{{action_url}}" style="height:45px;v-text-anchor:middle;width:200px;" arcsize="7%" stroke="f" fill="t">
                                        <v:fill type="tile" color="#414EF9" />
                                        <w:anchorlock/>
                                        <center style="color:#ffffff;font-family:sans-serif;font-size:15px;">Verify Email</center>
                                    </v:roundrect><![endif]-->
                                        <a href="${url}" class="button button--blue">Reset Password</a>
                                    </div>
                                    </td>
                                </tr>
                                </table>
                                <p>If you didn’t request a password reset, you can safely ignore this email — your password will remain unchanged.<br>
                                Thanks,<br>
                                The Webtray Team</p>
                                <!-- Sub copy -->
                                <table class="body-sub">
                                <tr>
                                    <td>
                                    <p class="sub">If you’re having trouble clicking the button, copy and paste the URL below into your web browser.
                                    </p>
                                    <p class="sub"><a href="${url}">${url}</a></p>
                                    </td>
                                </tr>
                                </table>
                            </td>
                            </tr>
                        </table>
                        </td>
                    </tr>
                    <tr>
                        <td>
                        <table class="email-footer" align="center" width="570" cellpadding="0" cellspacing="0">
                            <tr>
                            <td class="content-cell">
                                <p class="sub center">
                                Webtray.
                                <br>No. 40, Ahmadu Bello Way, Kano State, Nigeria.
                                </p>
                            </td>
                            </tr>
                        </table>
                        </td>
                    </tr>
                    </table>
                </td>
                </tr>
            </table>
            </body>
        </html>
    `,
    };

    await transporter.sendMail(mailOptions);
}
