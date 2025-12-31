import { renderError } from "./rich-content.service";

interface DiscordMessage {
    link: string;
    author: string;
    content: string;
    date: string;
}

export function renderDiscordMessage(message: DiscordMessage): string {
    if (!message.author || !message.date || !message.content) {
        return renderError(`Discord message is missing required fields.`, message);
    }

    return `
        <blockquote class="discord-message">
            <div class="byline">
                <div class="author">${message.author}</div>
                <time>${message.date}</time>
            </div>
            <div class="discord-message-content">
                ${message.content.replace(/\n/g, '<br/>')}
            </div>
            ${message.link ?
                `
                    <a class="discord-link" href="${message.link}">View original message</a>
                ` : ``}
        </blockquote>
    `;
}
