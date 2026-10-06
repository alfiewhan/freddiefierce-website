export async function onRequestPost(context) {

    try {

        const formData = await context.request.formData();

        const name = formData.get("name");
        const email = formData.get("email");
        const event = formData.get("event");
        const date = formData.get("date");
        const location = formData.get("location");
        const message = formData.get("message");

        console.log("NEW FREDDIE FIERCE BOOKING ENQUIRY");

        console.log({
            name,
            email,
            event,
            date,
            location,
            message
        });

        return new Response(
            JSON.stringify({
                success: true
            }),
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

    }

    catch (error) {

        return new Response(
            JSON.stringify({
                success: false
            }),
            {
                status: 500,
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

    }

}