import { CreateMLCEngine } from "https://esm.run/@mlc-ai/web-llm";

const $ = el => document.querySelector(el)

// el simbolo $ ahora funciona como un elemento del DOM

const $form = $('form')
const $input = $('input')
const $template = $('#message-template')
const $messages = $('ul')
const $container = $('main')
const $button = $('button')
const $info = $('small')

// Arreglo de mensajes de toda la conversacion
let messages = []

const SELECTED_MODEL = 'Llama-3.2-3B-Instruct-q4f32_1-MLC'

const engine = await CreateMLCEngine(
    SELECTED_MODEL,
    {
        //Aqui se personaliza el bot, para que sea mas ameno, amable, etc.
        initProgressCallback: (info) =>{
            //console.log('initProgressCallback', info)
            $info.textContent = `${info.text}%`

            if(info.progress === 1) {
                $button.removeAttribute('disabled')
            }
        }
    }
)

$form.addEventListener('submit', async (event) => {
    event.preventDefault()
    const messageText = $input.value.trim()

    if (messageText != ''){
        $input.value = ''    
    }

    addMessage(messageText, 'user')
    $button.setAttribute('disabled', '')

    const userMessage = {
        role: 'user',
        content: messageText
    }

    //Guardamos el mensaje del usuario
    messages.push(userMessage)

    //Un chunk es una manera de poder dibujar palabra por palabra
    //en lugar de esperar a todo el texto
    const chunks = await engine.chat.completions.create({
        messages,
        stream: true
    })
    
    let reply = ""
    const $botMessage = addMessage("", 'bot')

    for await (const chunk of chunks) {
        const [choice] = chunk.choices
        const content = choice?.delta?.content ?? ""
        reply += content
        $botMessage.textContent = reply
    }

    $button.removeAttribute('disabled')
    messages.push({
        role: 'assistant',
        content: reply
    })

    $container.scrollTop = $container.scrollHeight

})



function addMessage(text, sender){
    //Necesitamos clonar todo el template para ahi agregar los mensajes
    //Evita que modifiquemos los templates ya colocados previamente
    const clonedTemplate = $template.content.cloneNode(true)
    const $newMessage = clonedTemplate.querySelector('.message')
    
    const $who = $newMessage.querySelector('span')
    const $text = $newMessage.querySelector('p')

    $text.textContent = text
    $who.textContent = sender === 'bot' ? 'Bot' : 'Tú'
    $newMessage.classList.add(sender)

    //Posicionamos el scroll en el lugar adecuado tras haber mandado/recibido
    // un mensaje
    $messages.appendChild($newMessage)
    $container.scrollTop = $container.scrollHeight

    // Devuelve el elemento
    return $text
}