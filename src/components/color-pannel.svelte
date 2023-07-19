<script lang="ts">
    import { each } from "svelte/internal";

    let arr1 = []
    for (let i = 1; i<15;i++ ){
        arr1.push(i)
    }
    let arr2 = []
    for (let i = 25; i<39;i++ ){
        arr2.push(i)
    }
    console.log("svelte start!")

</script>

<div class="fn__flex" style="padding: 0 4px;display: block;">
    <div class="annptation_background" style="display: flex;">
        {#each arr1 as background}
        <button class="color__square" style="background-color:var(--b3-pdf-background{background})"></button>
        {/each}
    </div>
    <div class="annptation_line" style="display: flex;">
        {#each arr2 as line}
        <button class="color__square" style="background-color:var(--b3-pdf-background{line})"></button>
        {/each}
    </div>
</div>