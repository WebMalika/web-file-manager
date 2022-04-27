//TODO
if(!localStorage.getItem('folders')){
    localStorage.setItem('folders', JSON.stringify([{
        parent: null,
        id: 0,
        name: "/",
        isPrivate: false,
        dateCreate: '2022-02-12'
    }]))
}

if(!localStorage.getItem('files') || localStorage.getItem('files') == 'false'){
    localStorage.setItem('files', JSON.stringify([[]]))
}

const app = Vue.createApp({
    data(){
        return {
            // main data
            folders: JSON.parse(localStorage.getItem('folders')),
            files: JSON.parse(localStorage.getItem('files')),

            // navigation 
            curFolderID: 0,
            curDisk: null,
            counterFolders: 0,
            prevFolder: false,
            nextFolder: false,

            // modal for add object
            isVisiblePrivateModal: false,
            isVisibleAddModal: false,
            typeAddObj: null,
            privateStatusAddObj: false,
            nameAddObj: '',
            textAddModal: '',

            // other
            visiblePath: '/',
        }
    },
    mounted: function () { 
        this.curDisk = this.folders.filter(item => item.parent == this.curFolderID);
        this.counterFolders = this.folders.length;
    },
    methods: {
        toFolder(folder) {
            if(!folder.isPrivate){
                this.prevFolder = this.curFolderID;
                this.nextFolder = false;

                this.visiblePath += folder.name + '/';
                this.curFolderID = folder.id;
            }
        },

        toPrevFolder(){
            if(this.prevFolder === false) return;

            this.nextFolder = this.curFolderID;
            this.curFolderID = this.prevFolder;
            
            let parFolder = this.folders.find(item => item.id == this.curFolderID);
            if(parFolder.parent != null)
                this.prevFolder = parFolder.parent;
            else 
                this.prevFolder = false;

            // TODO 
            let tmpPath = this.visiblePath.split("/");
            tmpPath.pop();
            tmpPath.pop();
            this.visiblePath = tmpPath.join('/') + '/';
        },

        toNextFolder(){
            if(this.nextFolder === false) return;
            console.log(this.nextFolder);

            this.prevFolder = this.curFolderID;
            this.curFolderID = this.nextFolder;

            let parFolder = this.folders.find(item => item.id == this.curFolderID);
            this.visiblePath += parFolder.name + '/';

            this.nextFolder = false;
        },

        visibleModal(typeAddObj){
            this.typeAddObj = typeAddObj;
            
            if(typeAddObj == 'dir')
                this.textAddModal = "Добавить папку";
            else if(typeAddObj == 'file')
                this.textAddModal = "Добавить файл";

            if(!this.isVisibleAddModal){
                this.isVisibleAddModal = true;
            }
        },

        addNewObj(){
            if(!this.nameAddObj){
                this.$refs.modal__error.innerHTML = `<span class='fatal__error'><b>Ошибка!</b> Вы не ввели названиe!</span>`
                this.$refs.objName.classList.add('field_error');
                return;
            }
            
            let today = new Date(),
                dd = String(today.getDate()).padStart(2, '0'),
                mm = String(today.getMonth() + 1).padStart(2, '0'),
                yyyy = today.getFullYear();
            
            if(this.typeAddObj == 'dir'){
                this.folders.push({
                    parent: this.curFolderID,
                    id: this.counterFolders,
                    name: this.nameAddObj,
                    isPrivate: this.privateStatusAddObj,
                    dateCreate: yyyy + '-' + mm + '-' + dd
                })
                this.counterFolders++;

                this.files.push([]);
            } else {
                this.files[this.curFolderID].push({
                    name: this.nameAddObj,
                    isPrivate: this.privateStatusAddObj,
                    dateCreate: yyyy + '-' + mm + '-' + dd
                })
            }

            this.isVisibleAddModal = false;
            this.$refs.modal__error.innerHTML = '';
            this.$refs.objName.classList.remove('field_error');
            this.nameAddObj = ''
        }
    },
    computed: {
        updateCurDisk: function() {
            if(!this.folders) return;
            
            localStorage.setItem('folders', JSON.stringify(this.folders));
            localStorage.setItem('files', JSON.stringify(this.files));

            return this.curDisk = this.folders.filter(item => item.parent == this.curFolderID);
        }
    }
})

app.mount('#app');