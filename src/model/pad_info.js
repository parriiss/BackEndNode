"use strict"

module.exports = {

    Pad_update: (value, start ,end ) => {
        this.value = value;
        this.start = start;
        this.end = end;
    },

    Pad_info: (id, value, name) =>{
        this.id = id;
        this.name = name;
        this.value = value;
        this.Needs_flushing = false;
        this.Updates = [];

        Add_update = (val , st , en) => {
            this.Updates.push(Pad_update(val, st , en));
        }

        Rmv_updates = () => {  this.Updates = []   }

        /* Get contents of this pad from pad 
        the file that it's referencing */
        Get_Contents= ()=>{
            // Read file
            // save contents of file in value
        }

        /*  Update the contents of the file
            that pad is refering to    */
        Update_file = ()=>{
            // check if pad needs flushing
            if (this.Needs_flushing){
                // get find the right file
                // try and update it's contents
                // set needs_flushing to false if successful
                this.Needs_flushing = false
            }
        }

    }

}